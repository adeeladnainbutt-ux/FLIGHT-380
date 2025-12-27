#!/usr/bin/env python3
"""
Backend API Testing for Flight380 - Fare Calendar Caching Feature
Testing the new fare calendar endpoint with caching functionality
"""

import requests
import json
import time
import sys
from datetime import datetime, timedelta

# Get backend URL from frontend .env
BACKEND_URL = "https://quick-flight.preview.emergentagent.com/api"

def test_fare_calendar_caching():
    """Test the fare calendar endpoint with caching functionality"""
    print("=" * 60)
    print("TESTING FARE CALENDAR BACKEND CACHING FEATURE")
    print("=" * 60)
    
    # Test data as specified in the review request
    test_payload = {
        "origin": "LHR",
        "destination": "JFK", 
        "departure_date": "2025-12-27",
        "one_way": False,
        "duration": 7
    }
    
    endpoint = f"{BACKEND_URL}/flights/fare-calendar"
    
    print(f"Testing endpoint: {endpoint}")
    print(f"Test payload: {json.dumps(test_payload, indent=2)}")
    print()
    
    # Test 1: First request (should be Cache MISS)
    print("🔍 TEST 1: First request (expecting Cache MISS)")
    print("-" * 50)
    
    try:
        start_time = time.time()
        response1 = requests.post(endpoint, json=test_payload, timeout=30)
        end_time = time.time()
        
        print(f"Status Code: {response1.status_code}")
        print(f"Response Time: {end_time - start_time:.2f} seconds")
        
        if response1.status_code == 200:
            data1 = response1.json()
            print(f"Success: {data1.get('success')}")
            print(f"Origin: {data1.get('origin')}")
            print(f"Destination: {data1.get('destination')}")
            print(f"Currency: {data1.get('currency')}")
            print(f"Cached: {data1.get('cached', 'Not specified')}")
            print(f"Mock: {data1.get('mock', 'Not specified')}")
            
            # Check if data object exists and has fare information
            fare_data = data1.get('data', {})
            if fare_data:
                print(f"Fare data entries: {len(fare_data)}")
                # Show sample fare data
                sample_dates = list(fare_data.keys())[:5]
                print("Sample fare data:")
                for date in sample_dates:
                    print(f"  {date}: £{fare_data[date]}")
            else:
                print("❌ ERROR: No fare data in response")
                return False
                
        else:
            print(f"❌ ERROR: Request failed with status {response1.status_code}")
            print(f"Response: {response1.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Request failed - {str(e)}")
        return False
    
    print()
    
    # Test 2: Second request (should be Cache HIT)
    print("🔍 TEST 2: Second request (expecting Cache HIT)")
    print("-" * 50)
    
    try:
        start_time = time.time()
        response2 = requests.post(endpoint, json=test_payload, timeout=30)
        end_time = time.time()
        
        print(f"Status Code: {response2.status_code}")
        print(f"Response Time: {end_time - start_time:.2f} seconds")
        
        if response2.status_code == 200:
            data2 = response2.json()
            print(f"Success: {data2.get('success')}")
            print(f"Cached: {data2.get('cached', 'Not specified')}")
            print(f"Mock: {data2.get('mock', 'Not specified')}")
            
            # Compare response times (cached should be faster)
            time1 = end_time - start_time
            if hasattr(test_fare_calendar_caching, 'first_response_time'):
                time_diff = test_fare_calendar_caching.first_response_time - time1
                print(f"Time improvement: {time_diff:.2f} seconds")
            
            # Verify data consistency
            fare_data2 = data2.get('data', {})
            if fare_data2:
                print(f"Fare data entries: {len(fare_data2)}")
                
                # Compare with first response
                if fare_data == fare_data2:
                    print("✅ Data consistency: PASS (same fare data returned)")
                else:
                    print("⚠️  Data consistency: Different data returned")
            else:
                print("❌ ERROR: No fare data in second response")
                return False
                
        else:
            print(f"❌ ERROR: Second request failed with status {response2.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: Second request failed - {str(e)}")
        return False
    
    # Store first response time for comparison
    test_fare_calendar_caching.first_response_time = end_time - start_time
    
    print()
    print("✅ FARE CALENDAR CACHING TEST COMPLETED")
    return True

def test_fare_calendar_response_structure():
    """Test the response structure matches expected format"""
    print("=" * 60)
    print("TESTING FARE CALENDAR RESPONSE STRUCTURE")
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
        response = requests.post(endpoint, json=test_payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check required fields
            required_fields = ['success', 'data', 'currency', 'origin', 'destination']
            missing_fields = []
            
            for field in required_fields:
                if field not in data:
                    missing_fields.append(field)
            
            if missing_fields:
                print(f"❌ Missing required fields: {missing_fields}")
                return False
            
            # Verify success is True
            if not data.get('success'):
                print(f"❌ Success field is not True: {data.get('success')}")
                return False
            
            # Verify data object has dates and prices
            fare_data = data.get('data', {})
            if not fare_data:
                print("❌ Data object is empty")
                return False
            
            # Check if dates are in correct format and prices are numbers
            valid_entries = 0
            for date_str, price in fare_data.items():
                try:
                    # Validate date format
                    datetime.strptime(date_str, '%Y-%m-%d')
                    # Validate price is a number
                    if isinstance(price, (int, float)) and price > 0:
                        valid_entries += 1
                except ValueError:
                    print(f"❌ Invalid date format or price: {date_str} = {price}")
                    return False
            
            print(f"✅ Response structure: PASS")
            print(f"✅ Valid fare entries: {valid_entries}")
            print(f"✅ Currency: {data.get('currency')}")
            print(f"✅ Origin: {data.get('origin')}")
            print(f"✅ Destination: {data.get('destination')}")
            
            return True
            
        else:
            print(f"❌ Request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_different_routes():
    """Test caching works for different routes"""
    print("=" * 60)
    print("TESTING CACHING FOR DIFFERENT ROUTES")
    print("=" * 60)
    
    routes = [
        {"origin": "LHR", "destination": "CDG"},
        {"origin": "JFK", "destination": "LAX"},
        {"origin": "DXB", "destination": "BOM"}
    ]
    
    endpoint = f"{BACKEND_URL}/flights/fare-calendar"
    
    for route in routes:
        print(f"\n🔍 Testing route: {route['origin']} → {route['destination']}")
        
        test_payload = {
            "origin": route["origin"],
            "destination": route["destination"],
            "departure_date": "2025-12-27",
            "one_way": False,
            "duration": 7
        }
        
        try:
            # First request
            response1 = requests.post(endpoint, json=test_payload, timeout=30)
            if response1.status_code == 200:
                data1 = response1.json()
                print(f"  First request: Success={data1.get('success')}, Cached={data1.get('cached', 'N/A')}")
                
                # Second request
                response2 = requests.post(endpoint, json=test_payload, timeout=30)
                if response2.status_code == 200:
                    data2 = response2.json()
                    print(f"  Second request: Success={data2.get('success')}, Cached={data2.get('cached', 'N/A')}")
                else:
                    print(f"  ❌ Second request failed: {response2.status_code}")
            else:
                print(f"  ❌ First request failed: {response1.status_code}")
                
        except Exception as e:
            print(f"  ❌ ERROR: {str(e)}")
    
    return True

def check_backend_logs():
    """Instructions for checking backend logs for Cache MISS/HIT messages"""
    print("=" * 60)
    print("BACKEND LOGS CHECK INSTRUCTIONS")
    print("=" * 60)
    print()
    print("To verify caching is working, check the backend logs for:")
    print("1. 'Cache MISS for LHR_JFK' - on first request")
    print("2. 'Cache HIT for LHR_JFK' - on subsequent requests")
    print()
    print("Run this command to check backend logs:")
    print("tail -n 100 /var/log/supervisor/backend.*.log | grep -i cache")
    print()

def main():
    """Run all fare calendar tests"""
    print("🚀 STARTING FARE CALENDAR BACKEND TESTS")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Run tests
    tests_passed = 0
    total_tests = 3
    
    if test_fare_calendar_response_structure():
        tests_passed += 1
        print("✅ Response structure test: PASSED\n")
    else:
        print("❌ Response structure test: FAILED\n")
    
    if test_fare_calendar_caching():
        tests_passed += 1
        print("✅ Caching functionality test: PASSED\n")
    else:
        print("❌ Caching functionality test: FAILED\n")
    
    if test_different_routes():
        tests_passed += 1
        print("✅ Multiple routes test: PASSED\n")
    else:
        print("❌ Multiple routes test: FAILED\n")
    
    # Show log check instructions
    check_backend_logs()
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print(f"Tests Passed: {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("🎉 ALL TESTS PASSED!")
        return True
    else:
        print("⚠️  SOME TESTS FAILED")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)