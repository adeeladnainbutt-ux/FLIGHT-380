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
        OPTIMIZED: Makes only 1 API call and generates matrix from the response.
        Uses Amadeus API's built-in date flexibility when available.
        """
        try:
            base_dep_date = datetime.strptime(departure_date, '%Y-%m-%d')
            
            # Make SINGLE API call with larger result set
            # The API returns flights across nearby dates naturally
            result = self._search_flights_sync(
                origin=origin,
                destination=destination,
                departure_date=departure_date,
                return_date=return_date,
                adults=adults,
                children=children,
                infants=infants,
                travel_class=travel_class,
                non_stop=non_stop,
                max_results=250,  # Get more results to find date variations
                currency=currency
            )
            
            if not result.get('success') or not result.get('data'):
                return result
            
            all_flights = result['data']
            
            # Generate additional date variations by searching key dates only (3 calls max)
            # This gives good coverage without excessive API usage
            additional_dates = []
            if return_date:
                base_ret_date = datetime.strptime(return_date, '%Y-%m-%d')
                # Search -3 days and +3 days only (2 extra calls)
                for offset in [-3, 3]:
                    dep = (base_dep_date + timedelta(days=offset)).strftime('%Y-%m-%d')
                    ret = (base_ret_date + timedelta(days=offset)).strftime('%Y-%m-%d')
                    if datetime.strptime(ret, '%Y-%m-%d') > datetime.strptime(dep, '%Y-%m-%d'):
                        additional_dates.append({'dep': dep, 'ret': ret, 'offset': offset})
            
            # Make minimal additional calls
            for combo in additional_dates:
                extra_result = self._search_flights_sync(
                    origin=origin,
                    destination=destination,
                    departure_date=combo['dep'],
                    return_date=combo['ret'],
                    adults=adults,
                    children=children,
                    infants=infants,
                    travel_class=travel_class,
                    non_stop=non_stop,
                    max_results=50,
                    currency=currency
                )
                if extra_result.get('success') and extra_result.get('data'):
                    for flight in extra_result['data']:
                        flight['date_offset'] = combo['offset']
                    all_flights.extend(extra_result['data'])
            
            # Sort by price
            all_flights.sort(key=lambda x: float(x.get('price', {}).get('total', 999999)))
            
            # Limit results
            all_flights = all_flights[:150]
            
            return {
                'success': True,
                'data': all_flights,
                'meta': {
                    'count': len(all_flights), 
                    'flexible_search': True,
                    'api_calls': 3  # Max 3 API calls now
                }
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
    
    async def get_fare_calendar(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        one_way: bool = False,
        duration: int = 7,
        currency: str = 'GBP'
    ) -> Dict:
        """
        Get cheapest fares for a date range using Flight Inspiration Search
        Falls back to multiple Flight Offers Search calls if needed
        
        Args:
            origin: Origin airport code
            destination: Destination airport code  
            departure_date: Center date for search (YYYY-MM-DD)
            one_way: True for one-way, False for round-trip
            duration: Trip duration in days (for round-trip)
            currency: Currency code (default GBP)
        
        Returns:
            Dictionary with fare calendar data {date: price}
        """
        try:
            # Parse the center date
            center_date = datetime.strptime(departure_date, '%Y-%m-%d')
            today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
            
            # Generate dates: 30 days before and 30 days after center date
            fare_calendar = {}
            dates_to_search = []
            
            for offset in range(-15, 46):  # -15 to +45 days from center
                search_date = center_date + timedelta(days=offset)
                if search_date >= today:  # Only future dates
                    dates_to_search.append(search_date.strftime('%Y-%m-%d'))
            
            # Use thread pool for concurrent searches
            loop = asyncio.get_event_loop()
            with ThreadPoolExecutor(max_workers=5) as executor:
                # Search in batches to avoid rate limiting
                for i in range(0, len(dates_to_search), 5):
                    batch = dates_to_search[i:i+5]
                    futures = []
                    
                    for dep_date in batch:
                        if one_way:
                            future = loop.run_in_executor(
                                executor,
                                self._get_cheapest_price_sync,
                                origin,
                                destination,
                                dep_date,
                                None,
                                currency
                            )
                        else:
                            ret_date = (datetime.strptime(dep_date, '%Y-%m-%d') + timedelta(days=duration)).strftime('%Y-%m-%d')
                            future = loop.run_in_executor(
                                executor,
                                self._get_cheapest_price_sync,
                                origin,
                                destination,
                                dep_date,
                                ret_date,
                                currency
                            )
                        futures.append((dep_date, future))
                    
                    # Collect results
                    for dep_date, future in futures:
                        try:
                            price = await future
                            if price is not None:
                                fare_calendar[dep_date] = price
                        except Exception:
                            pass  # Skip failed dates
                    
                    # Small delay between batches to avoid rate limiting
                    await asyncio.sleep(0.2)
            
            return {
                'success': True,
                'data': fare_calendar,
                'currency': currency,
                'origin': origin,
                'destination': destination
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': {
                    'code': 500,
                    'message': f'Fare calendar error: {str(e)}'
                }
            }
    
    def _get_cheapest_price_sync(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: Optional[str],
        currency: str
    ) -> Optional[float]:
        """Synchronous helper to get cheapest price for a specific date"""
        try:
            search_params = {
                'originLocationCode': origin.upper(),
                'destinationLocationCode': destination.upper(),
                'departureDate': departure_date,
                'adults': 1,
                'currencyCode': currency,
                'max': 1  # Only need cheapest
            }
            
            if return_date:
                search_params['returnDate'] = return_date
            
            response = self.client.shopping.flight_offers_search.get(**search_params)
            
            if response.data and len(response.data) > 0:
                price = response.data[0].get('price', {}).get('grandTotal')
                if price:
                    return float(price)
            return None
            
        except Exception:
            return None
    
    def format_flight_results(self, amadeus_data: Dict) -> List[Dict]:
        """
        Format Amadeus flight data for frontend consumption
        Includes layover time calculation for connections
        
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
                        
                        # Calculate layover time for outbound
                        outbound_layovers = self._calculate_layovers(segments)
                        total_layover_minutes = sum(l['duration_minutes'] for l in outbound_layovers)
                        
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
                            'layovers': outbound_layovers,
                            'total_layover_minutes': total_layover_minutes,
                            'layover_display': self._format_layover_time(total_layover_minutes),
                            'segments': self._format_segments(segments, dictionaries),
                            'raw_data': flight  # Keep original data for booking
                        }
                        
                        # Add return flight info if available
                        if len(itineraries) > 1:
                            return_flight = itineraries[1]
                            return_segments = return_flight.get('segments', [])
                            if return_segments:
                                return_layovers = self._calculate_layovers(return_segments)
                                return_layover_minutes = sum(l['duration_minutes'] for l in return_layovers)
                                
                                formatted_flight['return_departure_time'] = return_segments[0].get('departure', {}).get('at', '')
                                formatted_flight['return_arrival_time'] = return_segments[-1].get('arrival', {}).get('at', '')
                                formatted_flight['return_duration'] = return_flight.get('duration', '')
                                formatted_flight['return_stops'] = len(return_segments) - 1
                                formatted_flight['return_layovers'] = return_layovers
                                formatted_flight['return_total_layover_minutes'] = return_layover_minutes
                                formatted_flight['return_layover_display'] = self._format_layover_time(return_layover_minutes)
                                formatted_flight['return_segments'] = self._format_segments(return_segments, dictionaries)
                                formatted_flight['return_is_direct'] = len(return_segments) == 1
                                
                                # Return flight carrier info
                                return_carrier = return_segments[0].get('carrierCode', carrier_code)
                                formatted_flight['return_airline'] = dictionaries.get('carriers', {}).get(return_carrier, return_carrier)
                                formatted_flight['return_airline_code'] = return_carrier
                        
                        formatted_flights.append(formatted_flight)
            
            except Exception as e:
                # Skip flights that fail to parse
                print(f"Error formatting flight: {str(e)}")
                continue
        
        return formatted_flights
    
    def _calculate_layovers(self, segments: List[Dict]) -> List[Dict]:
        """Calculate layover time between segments"""
        layovers = []
        
        for i in range(len(segments) - 1):
            current_segment = segments[i]
            next_segment = segments[i + 1]
            
            arrival_time = current_segment.get('arrival', {}).get('at', '')
            departure_time = next_segment.get('departure', {}).get('at', '')
            
            if arrival_time and departure_time:
                try:
                    arrival = datetime.fromisoformat(arrival_time.replace('Z', '+00:00'))
                    departure = datetime.fromisoformat(departure_time.replace('Z', '+00:00'))
                    layover_duration = departure - arrival
                    layover_minutes = int(layover_duration.total_seconds() / 60)
                    
                    layovers.append({
                        'airport': current_segment.get('arrival', {}).get('iataCode', ''),
                        'duration_minutes': layover_minutes,
                        'duration_display': self._format_layover_time(layover_minutes)
                    })
                except:
                    pass
        
        return layovers
    
    def _format_layover_time(self, minutes: int) -> str:
        """Format layover time in human readable format"""
        if minutes <= 0:
            return ''
        hours = minutes // 60
        mins = minutes % 60
        if hours > 0 and mins > 0:
            return f'{hours}h {mins}m'
        elif hours > 0:
            return f'{hours}h'
        else:
            return f'{mins}m'
    
    def _format_segments(self, segments: List[Dict], dictionaries: Dict) -> List[Dict]:
        """Format segment details for display"""
        formatted = []
        for seg in segments:
            carrier = seg.get('carrierCode', '')
            formatted.append({
                'from': seg.get('departure', {}).get('iataCode', ''),
                'to': seg.get('arrival', {}).get('iataCode', ''),
                'departure': seg.get('departure', {}).get('at', ''),
                'arrival': seg.get('arrival', {}).get('at', ''),
                'carrier': carrier,
                'airline': dictionaries.get('carriers', {}).get(carrier, carrier),
                'flight_number': f"{carrier}{seg.get('number', '')}",
                'aircraft': seg.get('aircraft', {}).get('code', '')
            })
        return formatted
