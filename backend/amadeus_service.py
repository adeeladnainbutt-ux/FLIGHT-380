from amadeus import Client, ResponseError
import os
from typing import Optional, Dict, List
from datetime import datetime

class AmadeusService:
    """Service to interact with Amadeus Flight Search API"""
    
    def __init__(self):
        self.client = Client(
            client_id=os.getenv('AMADEUS_API_KEY'),
            client_secret=os.getenv('AMADEUS_API_SECRET'),
            hostname=os.getenv('AMADEUS_HOSTNAME', 'test')  # 'test' for sandbox, 'production' for live
        )
    
    async def search_flights(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str] = None,
        adults: int = 1,
        children: int = 0,
        infants: int = 0,
        travel_class: str = 'ECONOMY',
        non_stop: bool = False,
        max_results: int = 50,
        currency: str = 'GBP'
    ) -> Dict:
        """
        Search for flight offers using Amadeus API
        
        Args:
            origin: IATA code for departure airport (e.g., 'LHR')
            destination: IATA code for arrival airport (e.g., 'JFK')
            departure_date: Departure date in YYYY-MM-DD format
            return_date: Return date in YYYY-MM-DD format (optional for one-way)
            adults: Number of adult passengers (12+)
            children: Number of child passengers (2-11)
            infants: Number of infant passengers (0-2)
            travel_class: ECONOMY, PREMIUM_ECONOMY, BUSINESS, or FIRST
            non_stop: True for direct flights only
            max_results: Maximum number of flight offers to return
        
        Returns:
            Dictionary with flight offers from Amadeus API
        """
        try:
            search_params = {
                'originLocationCode': origin.upper(),
                'destinationLocationCode': destination.upper(),
                'departureDate': departure_date,
                'adults': adults,
                'travelClass': travel_class,
                'nonStop': 'true' if non_stop else 'false',
                'max': max_results
            }
            
            # Add return date if provided (for round-trip)
            if return_date:
                search_params['returnDate'] = return_date
            
            # Add children and infants if specified
            if children > 0:
                search_params['children'] = children
            if infants > 0:
                search_params['infants'] = infants
            
            # Call Amadeus API
            response = self.client.shopping.flight_offers_search.get(**search_params)
            
            return {
                'success': True,
                'data': response.data,
                'meta': response.result.get('meta', {}),
                'dictionaries': response.result.get('dictionaries', {})
            }
            
        except ResponseError as error:
            return {
                'success': False,
                'error': {
                    'code': error.response.status_code,
                    'message': str(error),
                    'details': error.response.body if hasattr(error.response, 'body') else None
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'code': 500,
                    'message': f'Unexpected error: {str(e)}'
                }
            }
    
    async def search_airports(self, keyword: str, max_results: int = 10) -> Dict:
        """
        Search for airports by keyword
        
        Args:
            keyword: Search term (city name, airport code, etc.)
            max_results: Maximum number of results to return
        
        Returns:
            Dictionary with airport search results
        """
        try:
            response = self.client.reference_data.locations.get(
                keyword=keyword,
                subType='AIRPORT,CITY',
                page={'limit': max_results}
            )
            
            return {
                'success': True,
                'data': response.data
            }
            
        except ResponseError as error:
            return {
                'success': False,
                'error': {
                    'code': error.response.status_code,
                    'message': str(error)
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'code': 500,
                    'message': f'Unexpected error: {str(e)}'
                }
            }
    
    def format_flight_results(self, amadeus_data: Dict) -> List[Dict]:
        """
        Format Amadeus flight data for frontend consumption
        
        Args:
            amadeus_data: Raw response data from Amadeus API
        
        Returns:
            List of formatted flight offers
        """
        if not amadeus_data.get('success') or not amadeus_data.get('data'):
            return []
        
        formatted_flights = []
        flights = amadeus_data['data']
        dictionaries = amadeus_data.get('dictionaries', {})
        
        for flight in flights:
            try:
                itineraries = flight.get('itineraries', [])
                price = flight.get('price', {})
                
                # Get first itinerary (outbound)
                if itineraries and len(itineraries) > 0:
                    outbound = itineraries[0]
                    segments = outbound.get('segments', [])
                    
                    if segments:
                        first_segment = segments[0]
                        last_segment = segments[-1]
                        
                        # Extract airline info
                        carrier_code = first_segment.get('carrierCode', 'N/A')
                        airline_name = dictionaries.get('carriers', {}).get(carrier_code, carrier_code)
                        
                        formatted_flight = {
                            'id': flight.get('id'),
                            'from': first_segment.get('departure', {}).get('iataCode', ''),
                            'to': last_segment.get('arrival', {}).get('iataCode', ''),
                            'departure_time': first_segment.get('departure', {}).get('at', ''),
                            'arrival_time': last_segment.get('arrival', {}).get('at', ''),
                            'duration': outbound.get('duration', ''),
                            'stops': len(segments) - 1,
                            'airline': airline_name,
                            'airline_code': carrier_code,
                            'price': float(price.get('total', 0)),
                            'currency': price.get('currency', 'USD'),
                            'number_of_bookable_seats': flight.get('numberOfBookableSeats', 0),
                            'is_direct': len(segments) == 1,
                            'raw_data': flight  # Keep original data for booking
                        }
                        
                        # Add return flight info if available
                        if len(itineraries) > 1:
                            return_flight = itineraries[1]
                            return_segments = return_flight.get('segments', [])
                            if return_segments:
                                formatted_flight['return_departure_time'] = return_segments[0].get('departure', {}).get('at', '')
                                formatted_flight['return_arrival_time'] = return_segments[-1].get('arrival', {}).get('at', '')
                                formatted_flight['return_duration'] = return_flight.get('duration', '')
                        
                        formatted_flights.append(formatted_flight)
            
            except Exception as e:
                # Skip flights that fail to parse
                print(f"Error formatting flight: {str(e)}")
                continue
        
        return formatted_flights
