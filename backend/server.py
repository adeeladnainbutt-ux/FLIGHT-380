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