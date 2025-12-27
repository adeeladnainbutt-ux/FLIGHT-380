#!/usr/bin/env python3
"""
Frontend Integration Test for Flight380 - Fare Calendar Feature
Testing the frontend components and integration with backend caching
"""

import requests
import json
import re
from datetime import datetime

# Frontend URL
FRONTEND_URL = "https://fastfare-finder.preview.emergentagent.com"
BACKEND_URL = "https://fastfare-finder.preview.emergentagent.com/api"

def test_frontend_loads():
    """Test that the frontend loads successfully"""
    print("=" * 60)
    print("TESTING FRONTEND LOADS")
    print("=" * 60)
    
    try:
        response = requests.get(FRONTEND_URL, timeout=30)
        
        if response.status_code == 200:
            content = response.text
            
            # Check for React app indicators
            if 'react' in content.lower() or 'root' in content:
                print("✅ Frontend loads successfully")
                print(f"✅ Status Code: {response.status_code}")
                print(f"✅ Content Length: {len(content)} characters")
                return True
            else:
                print("❌ Frontend content doesn't appear to be React app")
                return False
        else:
            print(f"❌ Frontend failed to load: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_fare_calendar_api_integration():
    """Test the fare calendar API integration with specific test data"""
    print("=" * 60)
    print("TESTING FARE CALENDAR API INTEGRATION")
    print("=" * 60)
    
    # Test the exact payload from the review request
    test_payload = {
        "origin": "LHR",
        "destination": "JFK",
        "departure_date": "2025-12-27",
        "one_way": False,
        "duration": 7
    }
    
    endpoint = f"{BACKEND_URL}/flights/fare-calendar"
    
    print(f"Testing endpoint: {endpoint}")
    print(f"Payload: {json.dumps(test_payload, indent=2)}")
    print()
    
    try:
        # First request - should be Cache MISS or HIT depending on previous tests
        response = requests.post(endpoint, json=test_payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify required response structure
            required_fields = ['success', 'data', 'currency', 'origin', 'destination']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            # Verify success is True
            if not data.get('success'):
                print(f"❌ API returned success=False: {data}")
                return False
            
            # Verify data object has dates and prices
            fare_data = data.get('data', {})
            if not fare_data:
                print("❌ No fare data returned")
                return False
            
            print("✅ API Response Structure:")
            print(f"  ✅ Success: {data.get('success')}")
            print(f"  ✅ Origin: {data.get('origin')}")
            print(f"  ✅ Destination: {data.get('destination')}")
            print(f"  ✅ Currency: {data.get('currency')}")
            print(f"  ✅ Cached: {data.get('cached', 'Not specified')}")
            print(f"  ✅ Fare entries: {len(fare_data)}")
            
            # Show sample fare data
            sample_dates = list(fare_data.keys())[:5]
            print("  ✅ Sample fare data:")
            for date in sample_dates:
                print(f"    {date}: £{fare_data[date]}")
            
            # Verify fare data structure
            valid_entries = 0
            for date_str, price in fare_data.items():
                try:
                    # Validate date format
                    datetime.strptime(date_str, '%Y-%m-%d')
                    # Validate price is a number
                    if isinstance(price, (int, float)) and price > 0:
                        valid_entries += 1
                except ValueError:
                    print(f"❌ Invalid date/price format: {date_str} = {price}")
                    return False
            
            print(f"  ✅ Valid fare entries: {valid_entries}")
            
            return True
            
        else:
            print(f"❌ API request failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_component_implementation():
    """Test that the required components are properly implemented"""
    print("=" * 60)
    print("TESTING COMPONENT IMPLEMENTATION")
    print("=" * 60)
    
    # Check FlightSearch component
    try:
        with open('/app/frontend/src/components/FlightSearch.jsx', 'r') as f:
            flight_search_content = f.read()
        
        # Check for fare calendar integration
        checks = [
            ('BigCalendar import', 'BigCalendar' in flight_search_content),
            ('Fare state management', 'fares' in flight_search_content and 'setFares' in flight_search_content),
            ('Fare loading state', 'faresLoading' in flight_search_content),
            ('Backend API call', 'fare-calendar' in flight_search_content),
            ('Center-aligned button', 'justify-center' in flight_search_content),
        ]
        
        print("FlightSearch.jsx Component Checks:")
        all_passed = True
        for check_name, passed in checks:
            status = "✅" if passed else "❌"
            print(f"  {status} {check_name}")
            if not passed:
                all_passed = False
        
        if not all_passed:
            return False
            
    except Exception as e:
        print(f"❌ Error reading FlightSearch.jsx: {e}")
        return False
    
    # Check BigCalendar component
    try:
        with open('/app/frontend/src/components/ui/big-calendar.jsx', 'r') as f:
            big_calendar_content = f.read()
        
        # Check for fare display features
        checks = [
            ('Fare props handling', 'fares' in big_calendar_content),
            ('Price display on dates', 'formatPrice' in big_calendar_content or 'fare' in big_calendar_content),
            ('Color coding logic', 'getFareColor' in big_calendar_content or 'fareColor' in big_calendar_content),
            ('Legend with prices', 'Lowest' in big_calendar_content and 'Medium' in big_calendar_content and 'Highest' in big_calendar_content),
            ('Currency support', 'currency' in big_calendar_content),
        ]
        
        print("\nBigCalendar.jsx Component Checks:")
        for check_name, passed in checks:
            status = "✅" if passed else "❌"
            print(f"  {status} {check_name}")
            if not passed:
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Error reading BigCalendar.jsx: {e}")
        return False

def test_search_button_alignment():
    """Test that the Search Flights button is center-aligned"""
    print("=" * 60)
    print("TESTING SEARCH BUTTON ALIGNMENT")
    print("=" * 60)
    
    try:
        with open('/app/frontend/src/components/FlightSearch.jsx', 'r') as f:
            content = f.read()
        
        # Look for the search button containers
        lines = content.split('\n')
        
        search_button_contexts = []
        for i, line in enumerate(lines):
            if 'Search Flights' in line or 'Search Multi-City Flights' in line:
                # Get context around the button (5 lines before and after)
                start = max(0, i - 5)
                end = min(len(lines), i + 5)
                context = lines[start:end]
                search_button_contexts.append({
                    'line_num': i + 1,
                    'button_text': 'Search Flights' if 'Search Flights' in line else 'Search Multi-City Flights',
                    'context': context
                })
        
        print(f"Found {len(search_button_contexts)} search buttons:")
        
        all_centered = True
        for ctx in search_button_contexts:
            print(f"\n{ctx['button_text']} (line {ctx['line_num']}):")
            
            # Check if there's justify-center in the context
            context_text = '\n'.join(ctx['context'])
            is_centered = 'justify-center' in context_text
            
            status = "✅" if is_centered else "❌"
            print(f"  {status} Center alignment: {'Found justify-center' if is_centered else 'No justify-center found'}")
            
            if not is_centered:
                all_centered = False
                print("  Context:")
                for line in ctx['context']:
                    print(f"    {line.strip()}")
        
        return all_centered
        
    except Exception as e:
        print(f"❌ Error checking button alignment: {e}")
        return False

def test_caching_behavior():
    """Test the caching behavior with multiple requests"""
    print("=" * 60)
    print("TESTING CACHING BEHAVIOR")
    print("=" * 60)
    
    test_payload = {
        "origin": "LHR",
        "destination": "JFK",
        "departure_date": "2025-12-27",
        "one_way": False,
        "duration": 7
    }
    
    endpoint = f"{BACKEND_URL}/flights/fare-calendar"
    
    try:
        # Make 3 requests to test caching
        responses = []
        for i in range(3):
            print(f"Request {i+1}:")
            response = requests.post(endpoint, json=test_payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                cached = data.get('cached', False)
                print(f"  Status: {response.status_code}")
                print(f"  Cached: {cached}")
                print(f"  Success: {data.get('success')}")
                responses.append(data)
            else:
                print(f"  ❌ Request failed: {response.status_code}")
                return False
        
        # Verify all responses have the same data
        if len(responses) >= 2:
            first_data = responses[0].get('data', {})
            for i, resp in enumerate(responses[1:], 2):
                if resp.get('data', {}) == first_data:
                    print(f"✅ Response {i} data matches first response")
                else:
                    print(f"❌ Response {i} data differs from first response")
                    return False
        
        print("✅ Caching behavior test completed successfully")
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Run all frontend integration tests"""
    print("🚀 STARTING FRONTEND INTEGRATION TESTS")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tests = [
        ("Frontend Loads", test_frontend_loads),
        ("Fare Calendar API Integration", test_fare_calendar_api_integration),
        ("Component Implementation", test_component_implementation),
        ("Search Button Alignment", test_search_button_alignment),
        ("Caching Behavior", test_caching_behavior),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if test_func():
                print(f"✅ {test_name}: PASSED")
                passed += 1
            else:
                print(f"❌ {test_name}: FAILED")
        except Exception as e:
            print(f"❌ {test_name}: ERROR - {str(e)}")
    
    print("\n" + "="*60)
    print("FRONTEND INTEGRATION TEST SUMMARY")
    print("="*60)
    print(f"Tests Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL FRONTEND INTEGRATION TESTS PASSED!")
        return True
    else:
        print("⚠️  SOME FRONTEND INTEGRATION TESTS FAILED")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)