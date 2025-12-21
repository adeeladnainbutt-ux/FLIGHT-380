from amadeus import Client, ResponseError
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Dict, List
from datetime import datetime, timedelta

class AmadeusService:
    """Service to interact with Amadeus Flight Search API"""
    
    def __init__(self):
        self.client = Client(
            client_id=os.getenv('AMADEUS_API_KEY'),
            client_secret=os.getenv('AMADEUS_API_SECRET'),
            hostname=os.getenv('AMADEUS_HOSTNAME', 'test')  # 'test' for sandbox, 'production' for live
        )
    
    async def search_flights_flexible(
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
        currency: str = 'GBP'
    ) -> Dict:
        """
        Search for flights with flexible dates (±3 days)
        Uses thread pool for parallel API calls to significantly improve performance.
        """
        try:
            base_dep_date = datetime.strptime(departure_date, '%Y-%m-%d')
            
            # Build search combinations
            search_combinations = []
            
            # Vary departure dates with base return date (7 combinations)
            for day_offset in range(-3, 4):
                dep_date = base_dep_date + timedelta(days=day_offset)
                search_combinations.append({
                    'dep': dep_date.strftime('%Y-%m-%d'),
                    'ret': return_date,
                    'dep_offset': day_offset,
                    'ret_offset': 0
                })
            
            # Add diagonal combinations for variety
            if return_date:
                base_ret_date = datetime.strptime(return_date, '%Y-%m-%d')
                for day_offset in [-3, -2, 2, 3]:
                    dep_date = base_dep_date + timedelta(days=day_offset)
                    ret_date = base_ret_date + timedelta(days=day_offset)
                    if ret_date > dep_date:
                        search_combinations.append({
                            'dep': dep_date.strftime('%Y-%m-%d'),
                            'ret': ret_date.strftime('%Y-%m-%d'),
                            'dep_offset': day_offset,
                            'ret_offset': day_offset
                        })
            
            # Filter valid combinations
            valid_combinations = [
                combo for combo in search_combinations
                if not combo['ret'] or combo['dep'] < combo['ret']
            ]
            
            # Use thread pool for parallel API calls (Amadeus SDK is synchronous)
            def search_sync(combo):
                result = self._search_flights_sync(
                    origin=origin,
                    destination=destination,
                    departure_date=combo['dep'],
                    return_date=combo['ret'],
                    adults=adults,
                    children=children,
                    infants=infants,
                    travel_class=travel_class,
                    non_stop=non_stop,
                    max_results=5,
                    currency=currency
                )
                
                if result.get('success') and result.get('data'):
                    for flight in result['data']:
                        flight['dep_date_offset'] = combo['dep_offset']
                        flight['ret_date_offset'] = combo['ret_offset']
                        flight['search_dep_date'] = combo['dep']
                        flight['search_ret_date'] = combo['ret']
                    return result['data']
                return []
            
            # Execute all searches in parallel using thread pool
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor(max_workers=5) as executor:
                tasks = [loop.run_in_executor(executor, search_sync, combo) for combo in valid_combinations]
                results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Collect all flights from successful searches
            all_flights = []
            for result in results:
                if isinstance(result, list):
                    all_flights.extend(result)
            
            # Sort by price
            all_flights.sort(key=lambda x: float(x.get('price', {}).get('total', 999999)))
            
            # Limit results
            all_flights = all_flights[:75]
            
            return {
                'success': True,
                'data': all_flights,
                'meta': {'count': len(all_flights), 'flexible_search': True}
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'code': 500,
                    'message': f'Flexible search error: {str(e)}'
                }
            }
    
    def _search_flights_sync(
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
        """Synchronous version of search_flights for use in thread pool"""
        try:
            search_params = {
                'originLocationCode': origin.upper(),
                'destinationLocationCode': destination.upper(),
                'departureDate': departure_date,
                'adults': adults,
                'travelClass': travel_class,
                'nonStop': 'true' if non_stop else 'false',
                'currencyCode': currency,
                'max': max_results
            }
            
            if return_date:
                search_params['returnDate'] = return_date
            if children > 0:
                search_params['children'] = children
            if infants > 0:
                search_params['infants'] = infants
            
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
                'currencyCode': currency,
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
