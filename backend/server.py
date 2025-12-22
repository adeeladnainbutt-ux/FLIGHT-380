from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
import string
import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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

# SMTP Configuration
SMTP_HOST = os.environ.get('SMTP_HOST', 'smtp.ionos.co.uk')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'noreply@flight380.co.uk')
COMPANY_EMAIL = os.environ.get('COMPANY_EMAIL', 'info@flight380.co.uk')

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

# Contact Form Model
class ContactFormRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    subject: str
    booking_reference: Optional[str] = None
    message: str

# Email sending function using SMTP
async def send_email_smtp(to_email: str, subject: str, html_body: str, plain_body: str = None):
    """Send email using SMTP"""
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add plain text version
        if plain_body:
            part1 = MIMEText(plain_body, 'plain')
            msg.attach(part1)
        
        # Add HTML version
        part2 = MIMEText(html_body, 'html')
        msg.attach(part2)
        
        # Send email in thread to avoid blocking
        def send():
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
                server.send_message(msg)
        
        await asyncio.to_thread(send)
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

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


# ============================================
# CONTACT FORM ENDPOINT
# ============================================

@api_router.post("/contact")
async def submit_contact_form(request: ContactFormRequest):
    """Handle contact form submission - sends email to company and customer"""
    try:
        contact_id = str(uuid.uuid4())
        timestamp = datetime.now(timezone.utc).isoformat()
        
        # Store contact form submission in database
        contact_record = {
            "id": contact_id,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "email": request.email,
            "phone": request.phone,
            "subject": request.subject,
            "booking_reference": request.booking_reference,
            "message": request.message,
            "created_at": timestamp,
            "status": "NEW"
        }
        await db.contact_submissions.insert_one(contact_record)
        
        # Create email content for company (info@flight380.co.uk)
        company_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #E73121; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
                </div>
                <div style="padding: 20px; background: #f9f9f9;">
                    <h2 style="color: #E73121;">Customer Details</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{request.first_name} {request.last_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:{request.email}">{request.email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{request.phone or 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Subject:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{request.subject}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Booking Reference:</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #ddd;">{request.booking_reference or 'N/A'}</td>
                        </tr>
                    </table>
                    
                    <h2 style="color: #E73121; margin-top: 20px;">Message</h2>
                    <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd;">
                        {request.message.replace(chr(10), '<br>')}
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">
                        Reference ID: {contact_id}<br>
                        Submitted: {timestamp}
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create thank you email for customer
        customer_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #E73121; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">Thank You for Contacting Us!</h1>
                </div>
                <div style="padding: 20px; background: #f9f9f9;">
                    <p>Dear {request.first_name},</p>
                    
                    <p>Thank you for reaching out to Flight380. We have received your message and our team will get back to you as soon as possible.</p>
                    
                    <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; margin: 20px 0;">
                        <h3 style="color: #E73121; margin-top: 0;">Your Message Details</h3>
                        <p><strong>Subject:</strong> {request.subject}</p>
                        <p><strong>Reference ID:</strong> {contact_id}</p>
                        <p><strong>Your Message:</strong></p>
                        <p style="color: #666;">{request.message.replace(chr(10), '<br>')}</p>
                    </div>
                    
                    <p>Our customer support team typically responds within 24-48 hours. For urgent enquiries, please call us at:</p>
                    
                    <p style="font-size: 18px; color: #E73121; font-weight: bold;">📞 01908 220000</p>
                    <p><strong>Support Hours:</strong> 08:00 AM – 11:59 PM (GMT)</p>
                    
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                    
                    <p style="font-size: 12px; color: #666;">
                        Flight380<br>
                        277 Dunstable Road, Luton, Bedfordshire, LU4 8BS<br>
                        <a href="mailto:info@flight380.co.uk">info@flight380.co.uk</a>
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send emails
        company_email_sent = await send_email_smtp(
            COMPANY_EMAIL,
            f"[Flight380 Contact] {request.subject} - {request.first_name} {request.last_name}",
            company_html
        )
        
        customer_email_sent = await send_email_smtp(
            request.email,
            "Thank you for contacting Flight380",
            customer_html
        )
        
        # Update record with email status
        await db.contact_submissions.update_one(
            {"id": contact_id},
            {"$set": {
                "company_email_sent": company_email_sent,
                "customer_email_sent": customer_email_sent
            }}
        )
        
        return {
            "success": True,
            "message": "Thank you for your message! We have received your enquiry and will get back to you shortly.",
            "reference_id": contact_id,
            "emails_sent": {
                "company": company_email_sent,
                "customer": customer_email_sent
            }
        }
        
    except Exception as e:
        logger.error(f"Contact form error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to submit contact form: {str(e)}")


# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

import hashlib
import secrets
from fastapi import Response, Request, Cookie

# Auth Models
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class ForgotPassword(BaseModel):
    email: EmailStr

class SessionRequest(BaseModel):
    session_token: str
    user_data: Dict[str, Any]

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = "flight380_salt_"
    return hashlib.sha256((salt + password).encode()).hexdigest()

def generate_session_token() -> str:
    """Generate a secure session token"""
    return secrets.token_urlsafe(32)

@api_router.post("/auth/session")
async def store_session(request: SessionRequest, response: Response):
    """Store session from Google OAuth"""
    try:
        user_data = request.user_data
        
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data["email"]}, {"_id": 0})
        
        if existing_user:
            # Update existing user
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": user_data.get("name", existing_user.get("name")),
                    "picture": user_data.get("picture"),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        else:
            # Create new user
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.insert_one({
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data.get("name", ""),
                "picture": user_data.get("picture"),
                "auth_type": "google",
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        # Store session
        expires_at = datetime.now(timezone.utc).replace(day=datetime.now(timezone.utc).day + 7)
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": request.session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=request.session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60  # 7 days
        )
        
        return {"success": True, "user_id": user_id}
        
    except Exception as e:
        logger.error(f"Session storage error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/register")
async def register_user(user: UserRegister, response: Response):
    """Register a new user with email/password"""
    try:
        # Check if user exists
        existing = await db.users.find_one({"email": user.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        password_hash = hash_password(user.password)
        
        await db.users.insert_one({
            "user_id": user_id,
            "email": user.email,
            "name": user.name,
            "password_hash": password_hash,
            "auth_type": "email",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create session
        session_token = generate_session_token()
        expires_at = datetime.now(timezone.utc).replace(day=datetime.now(timezone.utc).day + 7)
        
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        return {
            "success": True,
            "user": {
                "user_id": user_id,
                "email": user.email,
                "name": user.name
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login_user(user: UserLogin, response: Response):
    """Login with email/password"""
    try:
        # Find user
        db_user = await db.users.find_one({"email": user.email}, {"_id": 0})
        if not db_user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check password
        if db_user.get("auth_type") == "google":
            raise HTTPException(status_code=400, detail="This account uses Google sign-in")
        
        password_hash = hash_password(user.password)
        if db_user.get("password_hash") != password_hash:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create session
        session_token = generate_session_token()
        expires_at = datetime.now(timezone.utc).replace(day=datetime.now(timezone.utc).day + 7)
        
        await db.user_sessions.insert_one({
            "user_id": db_user["user_id"],
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        return {
            "success": True,
            "user": {
                "user_id": db_user["user_id"],
                "email": db_user["email"],
                "name": db_user.get("name", ""),
                "picture": db_user.get("picture")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me")
async def get_current_user(request: Request, session_token: Optional[str] = Cookie(None)):
    """Get current user from session"""
    try:
        # Try cookie first, then Authorization header
        token = session_token
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
        
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")
        
        # Find session
        session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
        if not session:
            raise HTTPException(status_code=401, detail="Invalid session")
        
        # Check expiry
        expires_at = session["expires_at"]
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        
        # Get user
        user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0, "password_hash": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Auth check error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/logout")
async def logout_user(request: Request, response: Response, session_token: Optional[str] = Cookie(None)):
    """Logout user"""
    try:
        token = session_token
        if not token:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:]
        
        if token:
            await db.user_sessions.delete_one({"session_token": token})
        
        response.delete_cookie(key="session_token", path="/")
        
        return {"success": True}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return {"success": True}  # Always return success for logout

@api_router.post("/auth/forgot-password")
async def forgot_password(data: ForgotPassword):
    """Send password reset email (mocked)"""
    try:
        user = await db.users.find_one({"email": data.email}, {"_id": 0})
        
        # Always return success to prevent email enumeration
        if user:
            # Generate reset token
            reset_token = secrets.token_urlsafe(32)
            expires_at = datetime.now(timezone.utc).replace(hour=datetime.now(timezone.utc).hour + 1)
            
            await db.password_resets.insert_one({
                "user_id": user["user_id"],
                "token": reset_token,
                "expires_at": expires_at.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            })
            
            # Mock email sending
            await db.emails.insert_one({
                "to": data.email,
                "subject": "Flight380 - Password Reset",
                "body": f"Click here to reset your password: https://flight380.co.uk/reset-password?token={reset_token}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        
        return {"success": True, "message": "If an account exists with this email, you will receive a password reset link."}
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        return {"success": True, "message": "If an account exists with this email, you will receive a password reset link."}


# Include the router in the main app
app.include_router(api_router)

# CORS configuration - handle credentials properly
cors_origins_env = os.environ.get('CORS_ORIGINS', '*')
if cors_origins_env == '*':
    # When using wildcard with credentials, we need to dynamically set the origin
    # Use specific origins for production
    cors_origins = [
        "http://localhost:3000",
        "https://travelfix-1.preview.emergentagent.com",
        "https://flight380.co.uk",
        "https://www.flight380.co.uk"
    ]
else:
    cors_origins = cors_origins_env.split(',')

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
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