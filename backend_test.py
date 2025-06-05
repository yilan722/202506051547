#!/usr/bin/env python3
import requests
import json
import time
import uuid
from datetime import datetime
from enum import Enum
import os
import sys

# Base URL from frontend/.env
BASE_URL = "https://2c88e8ba-ff27-4a9a-9676-d0630e0ff5c3.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

# Test user data
TEST_USER = {
    "username": f"test_user_{uuid.uuid4().hex[:8]}",
    "email": f"test_{uuid.uuid4().hex[:8]}@example.com"
}

# Colors for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_header(message):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{message}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 80}{Colors.ENDC}\n")

def print_success(message):
    print(f"{Colors.OKGREEN}✓ {message}{Colors.ENDC}")

def print_failure(message):
    print(f"{Colors.FAIL}✗ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.OKBLUE}ℹ {message}{Colors.ENDC}")

def test_endpoint(method, endpoint, data=None, params=None, expected_status=200, description=""):
    url = f"{API_URL}{endpoint}"
    print_info(f"Testing {method} {url} - {description}")
    
    try:
        if method.upper() == "GET":
            response = requests.get(url, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, json=data, params=params)
        elif method.upper() == "PUT":
            response = requests.put(url, json=data)
        else:
            print_failure(f"Unsupported method: {method}")
            return None
        
        if response.status_code == expected_status:
            print_success(f"Status code: {response.status_code}")
            try:
                result = response.json()
                print_info(f"Response: {json.dumps(result, indent=2)}")
                return result
            except json.JSONDecodeError:
                print_failure("Failed to parse JSON response")
                return None
        else:
            print_failure(f"Expected status code {expected_status}, got {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_failure(f"Request failed: {str(e)}")
        return None

def run_tests():
    test_results = {
        "create_user": False,
        "get_user": False,
        "breathing_session": False,
        "zen_coin_balance": False,
        "zen_coin_transactions": False,
        "mood_diary": False,
        "get_achievements": False,
        "user_achievements": False,
        "get_courses": False,
        "available_courses": False,
        "complete_course": False,
        "leaderboard": False
    }
    
    user_id = None
    
    # 1. Test User Profile Management
    print_header("Testing User Profile Management")
    
    # Create a new user
    user_result = test_endpoint(
        "POST", 
        "/users", 
        data=TEST_USER,
        description="Create a new user profile"
    )
    
    if user_result:
        user_id = user_result.get("id")
        test_results["create_user"] = True
        print_success(f"Created user with ID: {user_id}")
    else:
        print_failure("Failed to create user")
        return test_results
    
    # Get user profile
    if user_id:
        user_profile = test_endpoint(
            "GET", 
            f"/users/{user_id}", 
            description="Get user profile by ID"
        )
        
        if user_profile and user_profile.get("id") == user_id:
            test_results["get_user"] = True
            print_success("Successfully retrieved user profile")
        else:
            print_failure("Failed to retrieve user profile")
    
    # 2. Test Breathing Sessions
    print_header("Testing Breathing Sessions")
    
    # Record a breathing session
    breathing_session_data = {
        "user_id": user_id,
        "intention": "Test breathing session",
        "pattern_name": "just-breathe",
        "cycles_completed": 5,
        "duration_seconds": 300
    }
    
    breathing_result = test_endpoint(
        "POST", 
        "/breathing-sessions", 
        data=breathing_session_data,
        description="Record a breathing session"
    )
    
    if breathing_result and breathing_result.get("zen_coins_earned") == 10:
        test_results["breathing_session"] = True
        print_success("Successfully recorded breathing session and awarded Zen Coins")
    else:
        print_failure("Failed to record breathing session or award Zen Coins")
    
    # 3. Test Zen Coin System
    print_header("Testing Zen Coin System")
    
    # Get Zen Coin balance
    balance_result = test_endpoint(
        "GET", 
        f"/zen-coins/{user_id}/balance", 
        description="Get user's Zen Coin balance"
    )
    
    if balance_result and "zen_coins" in balance_result:
        test_results["zen_coin_balance"] = True
        print_success(f"User has {balance_result['zen_coins']} Zen Coins")
    else:
        print_failure("Failed to get Zen Coin balance")
    
    # Get transaction history
    transactions_result = test_endpoint(
        "GET", 
        f"/zen-coins/{user_id}/transactions", 
        description="Get transaction history"
    )
    
    if transactions_result and isinstance(transactions_result, list):
        test_results["zen_coin_transactions"] = True
        print_success(f"Retrieved {len(transactions_result)} transactions")
    else:
        print_failure("Failed to get transaction history")
    
    # 4. Test Mood Diary
    print_header("Testing Mood Diary")
    
    # Create mood diary entry
    mood_data = {
        "user_id": user_id,
        "mood": "calm",
        "notes": "Feeling peaceful after breathing session"
    }
    
    mood_result = test_endpoint(
        "POST", 
        "/mood-diary", 
        data=mood_data,
        description="Create mood diary entry"
    )
    
    if mood_result and mood_result.get("zen_coins_earned") == 5:
        test_results["mood_diary"] = True
        print_success("Successfully created mood diary entry and awarded Zen Coins")
    else:
        print_failure("Failed to create mood diary entry or award Zen Coins")
    
    # 5. Test Achievements
    print_header("Testing Achievements")
    
    # Get all achievements
    all_achievements = test_endpoint(
        "GET", 
        "/achievements", 
        description="Get all available achievements"
    )
    
    if all_achievements and isinstance(all_achievements, list):
        test_results["get_achievements"] = True
        print_success(f"Retrieved {len(all_achievements)} achievements")
    else:
        print_failure("Failed to get achievements")
    
    # Get user's achievements
    user_achievements = test_endpoint(
        "GET", 
        f"/achievements/{user_id}", 
        description="Get user's unlocked achievements"
    )
    
    if user_achievements is not None:
        test_results["user_achievements"] = True
        print_success(f"User has unlocked {len(user_achievements)} achievements")
    else:
        print_failure("Failed to get user achievements")
    
    # 6. Test Courses
    print_header("Testing Courses")
    
    # Get all courses
    all_courses = test_endpoint(
        "GET", 
        "/courses", 
        description="Get all available courses"
    )
    
    course_id = None
    if all_courses and isinstance(all_courses, list) and len(all_courses) > 0:
        test_results["get_courses"] = True
        print_success(f"Retrieved {len(all_courses)} courses")
        course_id = all_courses[0].get("id")
    else:
        print_failure("Failed to get courses")
    
    # Get available courses
    available_courses = test_endpoint(
        "GET", 
        f"/courses/{user_id}/available", 
        description="Get courses available to user"
    )
    
    if available_courses and isinstance(available_courses, list):
        test_results["available_courses"] = True
        print_success(f"User has {len(available_courses)} available courses")
    else:
        print_failure("Failed to get available courses")
    
    # Complete a course
    if course_id:
        complete_course_result = test_endpoint(
            "POST", 
            f"/courses/{course_id}/complete", 
            params={"user_id": user_id},
            description="Complete a course"
        )
        
        if complete_course_result:
            test_results["complete_course"] = True
            print_success("Successfully completed course")
        else:
            print_failure("Failed to complete course")
    
    # 7. Test Leaderboard
    print_header("Testing Leaderboard")
    
    # Get leaderboard
    leaderboard_result = test_endpoint(
        "GET", 
        "/leaderboard", 
        description="Get Zen Coin leaderboard"
    )
    
    if leaderboard_result and isinstance(leaderboard_result, list):
        test_results["leaderboard"] = True
        print_success(f"Retrieved leaderboard with {len(leaderboard_result)} entries")
    else:
        print_failure("Failed to get leaderboard")
    
    # Print summary
    print_header("Test Summary")
    
    all_passed = True
    for test, result in test_results.items():
        if result:
            print_success(f"{test}: PASSED")
        else:
            all_passed = False
            print_failure(f"{test}: FAILED")
    
    if all_passed:
        print_success("All tests passed!")
    else:
        print_failure("Some tests failed.")
    
    return test_results

if __name__ == "__main__":
    print_header("Starting Zen Coin System Backend Tests")
    run_tests()