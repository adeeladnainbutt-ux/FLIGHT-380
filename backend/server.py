from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import string
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from amadeus_service import AmadeusService


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize Amadeus Service
amadeus_service = AmadeusService()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Agent email for confirmations
AGENT_EMAIL = "info@flight380.co.uk"


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Flight Search Models
class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    adults: int = 1
    youth: int = 0
    children: int = 0
    infants: int = 0
    travel_class: str = 'ECONOMY'
    direct_flights: bool = False
    flexible_dates: bool = False
    airline: Optional[str] = None

class AirportSearchRequest(BaseModel):
    keyword: str

# Booking Models
class PassengerInfo(BaseModel):
    type: str  # ADULT, CHILD, YOUTH, INFANT
    title: str  # Mr, Mrs, Ms, Miss
    first_name: str
    last_name: str
    date_of_birth: str
    gender: str
    nationality: str
    passport_number: Optional[str] = None
    passport_expiry: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

class ContactInfo(BaseModel):
    email: str
    phone: str
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None

class BookingRequest(BaseModel):
    flight_id: str
    flight_data: Dict[str, Any]
    passengers: List[PassengerInfo]
    contact: ContactInfo
    passenger_counts: Dict[str, int]  # {adults: 1, youth: 0, children: 0, infants: 0}
    total_price: float
    currency: str = "GBP"

class BookingResponse(BaseModel):
    success: bool
    booking_id: str
    pnr: str
    message: str
    booking_details: Optional[Dict[str, Any]] = None
    emails_sent: Optional[List[Dict[str, Any]]] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Flight Search Endpoints
@api_router.post("/flights/search")
async def search_flights(request: FlightSearchRequest):
    """Search for flights using Amadeus API"""
    try:
        # Map travel class to Amadeus format
        travel_class_map = {
            'economy': 'ECONOMY',
            'premium-economy': 'PREMIUM_ECONOMY',
            'business': 'BUSINESS',
            'first': 'FIRST'
        }
        
        amadeus_class = travel_class_map.get(request.travel_class.lower(), 'ECONOMY')
        
        # Calculate total passengers
        total_adults = request.adults + request.youth  # Youth counted as adults in Amadeus
        
        # Search flights - use flexible search if requested
        if request.flexible_dates:
            result = await amadeus_service.search_flights_flexible(
                origin=request.origin,
                destination=request.destination,
                departure_date=request.departure_date,
                return_date=request.return_date,
                adults=total_adults,
                children=request.children,
                infants=request.infants,
                travel_class=amadeus_class,
                non_stop=request.direct_flights
            )
        else:
            result = await amadeus_service.search_flights(
                origin=request.origin,
                destination=request.destination,
                departure_date=request.departure_date,
                return_date=request.return_date,
                adults=total_adults,
                children=request.children,
                infants=request.infants,
                travel_class=amadeus_class,
                non_stop=request.direct_flights
            )
        
        if result.get('success'):
            # Format the results for frontend
            formatted_flights = amadeus_service.format_flight_results(result)
            
            # Save search to database for analytics
            search_record = {
                'origin': request.origin,
                'destination': request.destination,
                'departure_date': request.departure_date,
                'return_date': request.return_date,
                'passengers': total_adults + request.children + request.infants,
                'results_count': len(formatted_flights),
                'timestamp': datetime.utcnow()
            }
            await db.flight_searches.insert_one(search_record)
            
            return {
                'success': True,
                'flights': formatted_flights,
                'count': len(formatted_flights),
                'meta': result.get('meta', {})
            }
        else:
            return {
                'success': False,
                'error': result.get('error', {})
            }
    
    except Exception as e:
        logger.error(f"Flight search error: {str(e)}")
        return {
            'success': False,
            'error': {
                'message': str(e)
            }
        }

@api_router.get("/airports/search")
async def search_airports(keyword: str):
    """Search for airports by keyword"""
    try:
        if len(keyword) < 2:
            return {
                'success': False,
                'error': 'Keyword must be at least 2 characters'
            }
        
        result = await amadeus_service.search_airports(keyword=keyword)
        return result
    
    except Exception as e:
        logger.error(f"Airport search error: {str(e)}")
        return {
            'success': False,
            'error': {
                'message': str(e)
            }
        }


# Booking Endpoints
def generate_pnr():
    """Generate a 6-character PNR code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def create_email_content(booking_data: dict, recipient_type: str) -> dict:
    """Create email content for booking confirmation"""
    pnr = booking_data['pnr']
    flight = booking_data['flight_data']
    passengers = booking_data['passengers']
    contact = booking_data['contact']
    total_price = booking_data['total_price']
    currency = booking_data.get('currency', 'GBP')
    
    # Build passenger list
    passenger_list = "\n".join([
        f"  - {p['title']} {p['first_name']} {p['last_name']} ({p['type']})"
        for p in passengers
    ])
    
    # Build flight details
    outbound_info = f"""
    From: {flight.get('from', 'N/A')} → To: {flight.get('to', 'N/A')}
    Date: {flight.get('departure_time', 'N/A')[:10] if flight.get('departure_time') else 'N/A'}
    Departure: {flight.get('departure_time', 'N/A')[11:16] if flight.get('departure_time') else 'N/A'}
    Arrival: {flight.get('arrival_time', 'N/A')[11:16] if flight.get('arrival_time') else 'N/A'}
    Duration: {flight.get('duration', 'N/A').replace('PT', '').replace('H', 'h ').replace('M', 'm')}
    Airline: {flight.get('airline', 'N/A')} ({flight.get('airline_code', 'N/A')})
    Stops: {'Direct' if flight.get('is_direct') else str(flight.get('stops', 0)) + ' stop(s)'}
    """
    
    return_info = ""
    if flight.get('return_departure_time'):
        return_info = f"""
    
    RETURN FLIGHT:
    From: {flight.get('to', 'N/A')} → To: {flight.get('from', 'N/A')}
    Date: {flight.get('return_departure_time', 'N/A')[:10]}
    Departure: {flight.get('return_departure_time', 'N/A')[11:16]}
    Arrival: {flight.get('return_arrival_time', 'N/A')[11:16]}
    Duration: {flight.get('return_duration', 'N/A').replace('PT', '').replace('H', 'h ').replace('M', 'm') if flight.get('return_duration') else 'N/A'}
    Stops: {'Direct' if flight.get('return_is_direct') else str(flight.get('return_stops', 0)) + ' stop(s)'}
    """
    
    if recipient_type == "customer":
        subject = f"Flight380 - Booking Confirmation - PNR: {pnr}"
        body = f"""
Dear {passengers[0]['first_name']} {passengers[0]['last_name']},

Thank you for booking with Flight380!

Your booking has been confirmed. Please find your details below:

═══════════════════════════════════════════════════════════════
BOOKING REFERENCE (PNR): {pnr}
═══════════════════════════════════════════════════════════════

FLIGHT DETAILS:
---------------
OUTBOUND FLIGHT:{outbound_info}{return_info}

PASSENGERS:
-----------
{passenger_list}

TOTAL PRICE: £{total_price:.2f} {currency}

CONTACT DETAILS:
---------------
Email: {contact['email']}
Phone: {contact['phone']}

═══════════════════════════════════════════════════════════════

IMPORTANT INFORMATION:
- Please arrive at the airport at least 2-3 hours before departure
- Carry a valid passport/ID and this booking confirmation
- Check airline website for baggage allowance

For any queries, contact us at: info@flight380.co.uk

Thank you for choosing Flight380!

Best regards,
Flight380 Team
www.flight380.co.uk
        """
    else:  # agent
        subject = f"New Booking - PNR: {pnr} - {flight.get('from')} to {flight.get('to')}"
        body = f"""
NEW BOOKING NOTIFICATION

═══════════════════════════════════════════════════════════════
BOOKING REFERENCE (PNR): {pnr}
BOOKING TIME: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
═══════════════════════════════════════════════════════════════

CUSTOMER DETAILS:
-----------------
Name: {passengers[0]['first_name']} {passengers[0]['last_name']}
Email: {contact['email']}
Phone: {contact['phone']}

FLIGHT DETAILS:
---------------
OUTBOUND FLIGHT:{outbound_info}{return_info}

ALL PASSENGERS:
---------------
{passenger_list}

PRICING:
--------
Total Amount: £{total_price:.2f} {currency}

═══════════════════════════════════════════════════════════════
This is an automated notification from Flight380 Booking System.
        """
    
    return {
        "subject": subject,
        "body": body
    }


@api_router.post("/bookings/create")
async def create_booking(request: BookingRequest):
    """Create a new flight booking and generate PNR"""
    try:
        # Generate unique PNR
        pnr = generate_pnr()
        booking_id = str(uuid.uuid4())
        
        # Create booking record
        booking_record = {
            "id": booking_id,
            "pnr": pnr,
            "flight_id": request.flight_id,
            "flight_data": request.flight_data,
            "passengers": [p.model_dump() for p in request.passengers],
            "contact": request.contact.model_dump(),
            "passenger_counts": request.passenger_counts,
            "total_price": request.total_price,
            "currency": request.currency,
            "status": "CONFIRMED",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Save booking to database
        await db.bookings.insert_one(booking_record)
        
        # Create mock emails (stored in database)
        customer_email_content = create_email_content(booking_record, "customer")
        agent_email_content = create_email_content(booking_record, "agent")
        
        customer_email = {
            "id": str(uuid.uuid4()),
            "booking_id": booking_id,
            "pnr": pnr,
            "type": "customer_confirmation",
            "to": request.contact.email,
            "subject": customer_email_content["subject"],
            "body": customer_email_content["body"],
            "status": "SENT",  # Mock - marked as sent
            "sent_at": datetime.now(timezone.utc).isoformat()
        }
        
        agent_email = {
            "id": str(uuid.uuid4()),
            "booking_id": booking_id,
            "pnr": pnr,
            "type": "agent_notification",
            "to": AGENT_EMAIL,
            "subject": agent_email_content["subject"],
            "body": agent_email_content["body"],
            "status": "SENT",  # Mock - marked as sent
            "sent_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Save emails to database
        await db.emails.insert_one(customer_email)
        await db.emails.insert_one(agent_email)
        
        logger.info(f"Booking created: PNR={pnr}, BookingID={booking_id}")
        
        return {
            "success": True,
            "booking_id": booking_id,
            "pnr": pnr,
            "message": "Booking confirmed successfully!",
            "booking_details": {
                "pnr": pnr,
                "status": "CONFIRMED",
                "flight": request.flight_data,
                "passengers": [p.model_dump() for p in request.passengers],
                "contact": request.contact.model_dump(),
                "total_price": request.total_price,
                "currency": request.currency,
                "created_at": booking_record["created_at"]
            },
            "emails_sent": [
                {
                    "to": request.contact.email,
                    "type": "Customer Confirmation",
                    "subject": customer_email_content["subject"],
                    "body": customer_email_content["body"],
                    "status": "SENT"
                },
                {
                    "to": AGENT_EMAIL,
                    "type": "Agent Notification",
                    "subject": agent_email_content["subject"],
                    "body": agent_email_content["body"],
                    "status": "SENT"
                }
            ]
        }
        
    except Exception as e:
        logger.error(f"Booking creation error: {str(e)}")
        return {
            "success": False,
            "message": f"Failed to create booking: {str(e)}"
        }


@api_router.get("/bookings/{pnr}")
async def get_booking(pnr: str):
    """Get booking details by PNR"""
    try:
        booking = await db.bookings.find_one({"pnr": pnr.upper()}, {"_id": 0})
        
        if not booking:
            return {
                "success": False,
                "message": "Booking not found"
            }
        
        # Get associated emails
        emails = await db.emails.find({"pnr": pnr.upper()}, {"_id": 0}).to_list(10)
        
        return {
            "success": True,
            "booking": booking,
            "emails": emails
        }
        
    except Exception as e:
        logger.error(f"Get booking error: {str(e)}")
        return {
            "success": False,
            "message": f"Error retrieving booking: {str(e)}"
        }


@api_router.get("/bookings")
async def list_bookings(limit: int = 20):
    """List all bookings"""
    try:
        bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
        return {
            "success": True,
            "bookings": bookings,
            "count": len(bookings)
        }
    except Exception as e:
        logger.error(f"List bookings error: {str(e)}")
        return {
            "success": False,
            "message": str(e)
        }


@api_router.get("/emails/{booking_id}")
async def get_booking_emails(booking_id: str):
    """Get all emails for a booking"""
    try:
        emails = await db.emails.find({"booking_id": booking_id}, {"_id": 0}).to_list(10)
        return {
            "success": True,
            "emails": emails
        }
    except Exception as e:
        logger.error(f"Get emails error: {str(e)}")
        return {
            "success": False,
            "message": str(e)
        }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()