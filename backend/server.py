from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, date
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Zen Coin System Enums
class AchievementType(str, Enum):
    DAILY_PRACTICE = "daily_practice"
    COURSE_COMPLETION = "course_completion"
    FRIEND_REFERRAL = "friend_referral"
    CONSECUTIVE_DAYS = "consecutive_days"
    MOOD_DIARY = "mood_diary"
    PAID_SUBSCRIPTION = "paid_subscription"

class CourseLevel(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"
    MASTER = "master"

class MoodType(str, Enum):
    VERY_HAPPY = "very_happy"
    HAPPY = "happy"
    NEUTRAL = "neutral"
    SAD = "sad"
    ANXIOUS = "anxious"
    STRESSED = "stressed"
    CALM = "calm"
    PEACEFUL = "peaceful"


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# User Profile and Zen Coin Models
class UserProfile(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: Optional[str] = None
    zen_coins: int = 0
    total_sessions: int = 0
    consecutive_days: int = 0
    last_practice_date: Optional[date] = None
    achievements: List[str] = Field(default_factory=list)
    referral_code: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    referred_by: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    username: str
    email: Optional[str] = None
    referred_by: Optional[str] = None

class ZenCoinTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: int
    transaction_type: AchievementType
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Achievement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    achievement_type: AchievementType
    zen_coin_reward: int
    requirements: Dict[str, Any]
    is_repeatable: bool = False
    icon: str = "🏆"

class Course(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    level: CourseLevel
    zen_coin_reward: int
    duration_minutes: int
    breathing_pattern: str  # References BREATHING_PATTERNS from frontend
    prerequisites: List[str] = Field(default_factory=list)
    is_active: bool = True

class CourseCompletion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    course_id: str
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    zen_coins_earned: int

class MoodDiaryEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    mood: MoodType
    notes: Optional[str] = None
    breathing_session_id: Optional[str] = None
    zen_coins_earned: int = 5
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BreathingSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    intention: str
    pattern_name: str
    cycles_completed: int
    duration_seconds: int
    zen_coins_earned: int
    completed_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models
class ZenCoinTransactionCreate(BaseModel):
    user_id: str
    amount: int
    transaction_type: AchievementType
    description: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class MoodDiaryCreate(BaseModel):
    user_id: str
    mood: MoodType
    notes: Optional[str] = None
    breathing_session_id: Optional[str] = None

class BreathingSessionCreate(BaseModel):
    user_id: str
    intention: str
    pattern_name: str
    cycles_completed: int
    duration_seconds: int

class CourseCreate(BaseModel):
    name: str
    description: str
    level: CourseLevel
    zen_coin_reward: int
    duration_minutes: int
    breathing_pattern: str
    prerequisites: List[str] = Field(default_factory=list)

# Payment models
class DonationRequest(BaseModel):
    amount: float
    origin_url: str
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None

class CheckoutSessionResponse(BaseModel):
    url: str
    session_id: str

class PaymentStatusResponse(BaseModel):
    status: str
    payment_status: str
    amount_total: int
    currency: str

class PaymentTransaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    amount: float
    currency: str = "usd"
    status: str = "pending"
    payment_status: str = "unpaid"
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    metadata: Dict = Field(default_factory=dict)

# Donation packages (predefined for security)
DONATION_PACKAGES = {
    "small": {"amount": 5.0, "name": "Support Our Mission", "description": "Help keep the app ad-free"},
    "medium": {"amount": 15.0, "name": "Nurture Growth", "description": "Support new features and improvements"},
    "large": {"amount": 30.0, "name": "Flourish Together", "description": "Help us reach more souls seeking peace"},
    "custom": {"min_amount": 1.0, "max_amount": 500.0}
}

# Default Achievements
DEFAULT_ACHIEVEMENTS = [
    {
        "name": "First Steps",
        "description": "Complete your first breathing session",
        "achievement_type": AchievementType.DAILY_PRACTICE,
        "zen_coin_reward": 10,
        "requirements": {"sessions": 1},
        "is_repeatable": False,
        "icon": "🌱"
    },
    {
        "name": "Daily Zen",
        "description": "Complete daily breathing practice",
        "achievement_type": AchievementType.DAILY_PRACTICE,
        "zen_coin_reward": 10,
        "requirements": {"daily": True},
        "is_repeatable": True,
        "icon": "🧘"
    },
    {
        "name": "Week Warrior",
        "description": "Practice for 7 consecutive days",
        "achievement_type": AchievementType.CONSECUTIVE_DAYS,
        "zen_coin_reward": 50,
        "requirements": {"consecutive_days": 7},
        "is_repeatable": False,
        "icon": "🔥"
    },
    {
        "name": "Zen Master",
        "description": "Practice for 30 consecutive days",
        "achievement_type": AchievementType.CONSECUTIVE_DAYS,
        "zen_coin_reward": 500,
        "requirements": {"consecutive_days": 30},
        "is_repeatable": False,
        "icon": "🏆"
    },
    {
        "name": "Course Graduate",
        "description": "Complete a breathing course",
        "achievement_type": AchievementType.COURSE_COMPLETION,
        "zen_coin_reward": 30,
        "requirements": {"courses": 1},
        "is_repeatable": False,
        "icon": "🎓"
    },
    {
        "name": "Heart Reflector",
        "description": "Submit your first mood diary entry",
        "achievement_type": AchievementType.MOOD_DIARY,
        "zen_coin_reward": 5,
        "requirements": {"mood_entries": 1},
        "is_repeatable": False,
        "icon": "💝"
    },
    {
        "name": "Community Builder",
        "description": "Invite a friend to join",
        "achievement_type": AchievementType.FRIEND_REFERRAL,
        "zen_coin_reward": 50,
        "requirements": {"referrals": 1},
        "is_repeatable": True,
        "icon": "🤝"
    },
    {
        "name": "Zen Supporter",
        "description": "Support the community with a subscription",
        "achievement_type": AchievementType.PAID_SUBSCRIPTION,
        "zen_coin_reward": 200,
        "requirements": {"subscription": True},
        "is_repeatable": False,
        "icon": "💎"
    }
]

# Default Courses
DEFAULT_COURSES = [
    {
        "name": "Mindful Beginnings",
        "description": "Introduction to conscious breathing",
        "level": CourseLevel.BEGINNER,
        "zen_coin_reward": 30,
        "duration_minutes": 10,
        "breathing_pattern": "just-breathe",
        "prerequisites": []
    },
    {
        "name": "Focus Foundation",
        "description": "Build concentration through breath",
        "level": CourseLevel.BEGINNER,
        "zen_coin_reward": 35,
        "duration_minutes": 15,
        "breathing_pattern": "sharpen-focus",
        "prerequisites": []
    },
    {
        "name": "Calm Mastery",
        "description": "Advanced techniques for inner peace",
        "level": CourseLevel.INTERMEDIATE,
        "zen_coin_reward": 60,
        "duration_minutes": 20,
        "breathing_pattern": "calm-before-event",
        "prerequisites": ["mindful-beginnings"]
    },
    {
        "name": "Deep Sleep Wisdom",
        "description": "Master the art of restful preparation",
        "level": CourseLevel.INTERMEDIATE,
        "zen_coin_reward": 65,
        "duration_minutes": 25,
        "breathing_pattern": "drift-to-sleep",
        "prerequisites": ["mindful-beginnings"]
    },
    {
        "name": "Anxiety Transformation",
        "description": "Transform worry into wisdom",
        "level": CourseLevel.ADVANCED,
        "zen_coin_reward": 85,
        "duration_minutes": 30,
        "breathing_pattern": "soothe-mind",
        "prerequisites": ["calm-mastery", "focus-foundation"]
    },
    {
        "name": "Zen Mastery",
        "description": "The ultimate breathing mastery course",
        "level": CourseLevel.MASTER,
        "zen_coin_reward": 100,
        "duration_minutes": 45,
        "breathing_pattern": "just-breathe",
        "prerequisites": ["anxiety-transformation", "deep-sleep-wisdom"]
    }
]

# Utility functions for Zen Coin system
async def calculate_consecutive_days(user_id: str) -> int:
    """Calculate consecutive days of practice for a user"""
    user = await db.user_profiles.find_one({"id": user_id})
    if not user:
        return 0
    
    if not user.get("last_practice_date"):
        return 0
    
    # Get today's date
    today = date.today()
    last_practice = user["last_practice_date"]
    
    # If last practice was today, return current consecutive days
    if last_practice == today:
        return user.get("consecutive_days", 0)
    
    # If last practice was yesterday, we can continue the streak
    if (today - last_practice).days == 1:
        return user.get("consecutive_days", 0) + 1
    
    # If gap is more than 1 day, streak is broken
    return 1 if last_practice == today else 1

async def award_zen_coins(user_id: str, amount: int, transaction_type: AchievementType, description: str, metadata: Dict = None):
    """Award Zen Coins to a user and create transaction record"""
    if metadata is None:
        metadata = {}
    
    # Update user's zen coin balance
    await db.user_profiles.update_one(
        {"id": user_id},
        {
            "$inc": {"zen_coins": amount},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    # Create transaction record
    transaction = ZenCoinTransaction(
        user_id=user_id,
        amount=amount,
        transaction_type=transaction_type,
        description=description,
        metadata=metadata
    )
    
    await db.zen_coin_transactions.insert_one(transaction.dict())
    return transaction

async def check_and_award_achievements(user_id: str):
    """Check if user has earned any new achievements"""
    user = await db.user_profiles.find_one({"id": user_id})
    if not user:
        return []
    
    awarded_achievements = []
    
    # Get all achievements
    achievements = await db.achievements.find().to_list(1000)
    
    for achievement in achievements:
        achievement_id = achievement["id"]
        
        # Skip if already earned and not repeatable
        if achievement_id in user.get("achievements", []) and not achievement.get("is_repeatable", False):
            continue
        
        # Check achievement requirements
        requirements = achievement.get("requirements", {})
        earned = False
        
        if achievement["achievement_type"] == AchievementType.DAILY_PRACTICE:
            if requirements.get("sessions") and user.get("total_sessions", 0) >= requirements["sessions"]:
                earned = True
            elif requirements.get("daily") and user.get("last_practice_date") == date.today():
                earned = True
                
        elif achievement["achievement_type"] == AchievementType.CONSECUTIVE_DAYS:
            if user.get("consecutive_days", 0) >= requirements.get("consecutive_days", 0):
                earned = True
                
        elif achievement["achievement_type"] == AchievementType.COURSE_COMPLETION:
            # Count completed courses
            completed_courses = await db.course_completions.count_documents({"user_id": user_id})
            if completed_courses >= requirements.get("courses", 0):
                earned = True
                
        elif achievement["achievement_type"] == AchievementType.MOOD_DIARY:
            # Count mood diary entries
            mood_entries = await db.mood_diary_entries.count_documents({"user_id": user_id})
            if mood_entries >= requirements.get("mood_entries", 0):
                earned = True
                
        elif achievement["achievement_type"] == AchievementType.FRIEND_REFERRAL:
            # Count referrals
            referrals = await db.user_profiles.count_documents({"referred_by": user.get("referral_code")})
            if referrals >= requirements.get("referrals", 0):
                earned = True
        
        if earned:
            # Award achievement
            await db.user_profiles.update_one(
                {"id": user_id},
                {"$addToSet": {"achievements": achievement_id}}
            )
            
            # Award Zen Coins
            await award_zen_coins(
                user_id,
                achievement["zen_coin_reward"],
                achievement["achievement_type"],
                f"Achievement unlocked: {achievement['name']}",
                {"achievement_id": achievement_id}
            )
            
            awarded_achievements.append(achievement)
    
    return awarded_achievements

async def initialize_default_data():
    """Initialize default achievements and courses if they don't exist"""
    # Check if achievements exist
    achievement_count = await db.achievements.count_documents({})
    if achievement_count == 0:
        for achievement_data in DEFAULT_ACHIEVEMENTS:
            achievement = Achievement(**achievement_data)
            await db.achievements.insert_one(achievement.dict())
    
    # Check if courses exist
    course_count = await db.courses.count_documents({})
    if course_count == 0:
        for course_data in DEFAULT_COURSES:
            course = Course(**course_data)
            await db.courses.insert_one(course.dict())

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Restorative Lands API - Breathe & Bloom"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Donation endpoints
@api_router.post("/donations/create-session", response_model=CheckoutSessionResponse)
async def create_donation_session(request: DonationRequest):
    """Create a donation checkout session"""
    
    try:
        # Validate amount
        if request.amount < DONATION_PACKAGES["custom"]["min_amount"]:
            raise HTTPException(400, f"Minimum donation amount is ${DONATION_PACKAGES['custom']['min_amount']}")
        if request.amount > DONATION_PACKAGES["custom"]["max_amount"]:
            raise HTTPException(400, f"Maximum donation amount is ${DONATION_PACKAGES['custom']['max_amount']}")
        
        # Create session ID
        session_id = f"cs_demo_{datetime.utcnow().timestamp()}"
        
        # Create payment transaction record
        transaction = PaymentTransaction(
            session_id=session_id,
            amount=request.amount,
            donor_name=request.donor_name,
            donor_email=request.donor_email,
            metadata={
                "source": "restorative_lands_donation",
                "origin_url": request.origin_url
            }
        )
        
        # Store in database
        await db.payment_transactions.insert_one(transaction.dict())
        
        # For demo, create a mock payment URL
        demo_checkout_url = f"{request.origin_url}/demo-payment?session_id={session_id}&amount={request.amount}"
        
        return CheckoutSessionResponse(
            url=demo_checkout_url,
            session_id=session_id
        )
        
    except Exception as e:
        raise HTTPException(500, f"Failed to create checkout session: {str(e)}")

@api_router.get("/donations/status/{session_id}", response_model=PaymentStatusResponse)
async def get_donation_status(session_id: str):
    """Get the status of a donation session"""
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    
    if not transaction:
        raise HTTPException(404, "Session not found")
    
    return PaymentStatusResponse(
        status=transaction["status"],
        payment_status=transaction["payment_status"],
        amount_total=int(transaction["amount"] * 100),  # Convert to cents
        currency=transaction["currency"]
    )

@api_router.post("/donations/confirm/{session_id}")
async def confirm_donation(session_id: str):
    """Confirm a donation (demo endpoint)"""
    
    transaction = await db.payment_transactions.find_one({"session_id": session_id})
    
    if not transaction:
        raise HTTPException(404, "Session not found")
    
    # Update transaction status
    update_data = {
        "status": "complete",
        "payment_status": "paid",
        "completed_at": datetime.utcnow()
    }
    
    await db.payment_transactions.update_one(
        {"session_id": session_id},
        {"$set": update_data}
    )
    
    return {"message": "Donation confirmed successfully", "session_id": session_id}

@api_router.get("/donations/packages")
async def get_donation_packages():
    """Get available donation packages"""
    return DONATION_PACKAGES

@api_router.get("/oasis/stats")
async def get_global_oasis_stats():
    """Get global oasis statistics"""
    return {
        "total_sessions": 1000,
        "total_elements_grown": 25000,
        "active_gardens": 150,
        "collective_breath_cycles": 50000
    }

# ========== ZEN COIN SYSTEM API ENDPOINTS ==========

# User Profile endpoints
@api_router.post("/users", response_model=UserProfile)
async def create_user_profile(user_data: UserProfileCreate):
    """Create a new user profile"""
    user = UserProfile(**user_data.dict())
    await db.user_profiles.insert_one(user.dict())
    
    # Award Zen Coins if referred by someone
    if user_data.referred_by:
        referrer = await db.user_profiles.find_one({"referral_code": user_data.referred_by})
        if referrer:
            await award_zen_coins(
                referrer["id"],
                50,
                AchievementType.FRIEND_REFERRAL,
                f"Friend referral: {user.username} joined",
                {"referred_user_id": user.id}
            )
            await check_and_award_achievements(referrer["id"])
    
    return user

@api_router.get("/users/{user_id}", response_model=UserProfile)
async def get_user_profile(user_id: str):
    """Get user profile by ID"""
    user = await db.user_profiles.find_one({"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    return UserProfile(**user)

@api_router.put("/users/{user_id}", response_model=UserProfile)
async def update_user_profile(user_id: str, updates: dict):
    """Update user profile"""
    updates["updated_at"] = datetime.utcnow()
    result = await db.user_profiles.update_one({"id": user_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(404, "User not found")
    
    user = await db.user_profiles.find_one({"id": user_id})
    return UserProfile(**user)

# Breathing Session endpoints
@api_router.post("/breathing-sessions", response_model=BreathingSession)
async def create_breathing_session(session_data: BreathingSessionCreate):
    """Record a completed breathing session and award Zen Coins"""
    session = BreathingSession(
        **session_data.dict(),
        zen_coins_earned=10  # Base reward for daily practice
    )
    await db.breathing_sessions.insert_one(session.dict())
    
    # Update user stats
    today = date.today()
    consecutive_days = await calculate_consecutive_days(session.user_id)
    
    await db.user_profiles.update_one(
        {"id": session.user_id},
        {
            "$inc": {"total_sessions": 1},
            "$set": {
                "last_practice_date": today,
                "consecutive_days": consecutive_days,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Award Zen Coins for daily practice
    await award_zen_coins(
        session.user_id,
        10,
        AchievementType.DAILY_PRACTICE,
        f"Daily practice: {session.pattern_name}",
        {"session_id": session.id}
    )
    
    # Check for achievements
    await check_and_award_achievements(session.user_id)
    
    return session

@api_router.get("/breathing-sessions/{user_id}")
async def get_user_sessions(user_id: str, limit: int = 50):
    """Get user's breathing sessions"""
    sessions = await db.breathing_sessions.find({"user_id": user_id}).sort("completed_at", -1).limit(limit).to_list(limit)
    return [BreathingSession(**session) for session in sessions]

# Zen Coin Transaction endpoints
@api_router.get("/zen-coins/{user_id}/balance")
async def get_zen_coin_balance(user_id: str):
    """Get user's current Zen Coin balance"""
    user = await db.user_profiles.find_one({"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    return {"user_id": user_id, "zen_coins": user.get("zen_coins", 0)}

@api_router.get("/zen-coins/{user_id}/transactions")
async def get_zen_coin_transactions(user_id: str, limit: int = 100):
    """Get user's Zen Coin transaction history"""
    transactions = await db.zen_coin_transactions.find({"user_id": user_id}).sort("timestamp", -1).limit(limit).to_list(limit)
    return [ZenCoinTransaction(**txn) for txn in transactions]

@api_router.post("/zen-coins/award")
async def award_zen_coins_endpoint(transaction: ZenCoinTransactionCreate):
    """Award Zen Coins to a user (admin function)"""
    result = await award_zen_coins(
        transaction.user_id,
        transaction.amount,
        transaction.transaction_type,
        transaction.description,
        transaction.metadata
    )
    return result

# Achievement endpoints
@api_router.get("/achievements")
async def get_all_achievements():
    """Get all available achievements"""
    achievements = await db.achievements.find().to_list(1000)
    return [Achievement(**achievement) for achievement in achievements]

@api_router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """Get user's unlocked achievements"""
    user = await db.user_profiles.find_one({"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    achievement_ids = user.get("achievements", [])
    achievements = await db.achievements.find({"id": {"$in": achievement_ids}}).to_list(1000)
    return [Achievement(**achievement) for achievement in achievements]

# Course endpoints
@api_router.get("/courses")
async def get_all_courses():
    """Get all available courses"""
    courses = await db.courses.find({"is_active": True}).to_list(1000)
    return [Course(**course) for course in courses]

@api_router.get("/courses/{user_id}/available")
async def get_available_courses(user_id: str):
    """Get courses available to user based on prerequisites"""
    user = await db.user_profiles.find_one({"id": user_id})
    if not user:
        raise HTTPException(404, "User not found")
    
    # Get completed courses
    completed_course_ids = await db.course_completions.find({"user_id": user_id}).distinct("course_id")
    completed_courses = await db.courses.find({"id": {"$in": completed_course_ids}}).to_list(1000)
    completed_course_names = [course["name"].lower().replace(" ", "-") for course in completed_courses]
    
    # Get all courses
    all_courses = await db.courses.find({"is_active": True}).to_list(1000)
    
    available_courses = []
    for course in all_courses:
        # Check if prerequisites are met
        prerequisites_met = all(prereq in completed_course_names for prereq in course.get("prerequisites", []))
        if prerequisites_met:
            available_courses.append(Course(**course))
    
    return available_courses

@api_router.post("/courses/{course_id}/complete")
async def complete_course(course_id: str, user_id: str):
    """Mark a course as completed and award Zen Coins"""
    course = await db.courses.find_one({"id": course_id})
    if not course:
        raise HTTPException(404, "Course not found")
    
    # Check if already completed
    existing_completion = await db.course_completions.find_one({"user_id": user_id, "course_id": course_id})
    if existing_completion:
        raise HTTPException(400, "Course already completed")
    
    # Create completion record
    completion = CourseCompletion(
        user_id=user_id,
        course_id=course_id,
        zen_coins_earned=course["zen_coin_reward"]
    )
    await db.course_completions.insert_one(completion.dict())
    
    # Award Zen Coins
    await award_zen_coins(
        user_id,
        course["zen_coin_reward"],
        AchievementType.COURSE_COMPLETION,
        f"Course completed: {course['name']}",
        {"course_id": course_id}
    )
    
    # Check for achievements
    await check_and_award_achievements(user_id)
    
    return completion

# Mood Diary endpoints
@api_router.post("/mood-diary", response_model=MoodDiaryEntry)
async def create_mood_diary_entry(entry_data: MoodDiaryCreate):
    """Create a mood diary entry and award Zen Coins"""
    entry = MoodDiaryEntry(**entry_data.dict())
    await db.mood_diary_entries.insert_one(entry.dict())
    
    # Award Zen Coins
    await award_zen_coins(
        entry.user_id,
        5,
        AchievementType.MOOD_DIARY,
        f"Mood reflection: {entry.mood.value}",
        {"mood_entry_id": entry.id}
    )
    
    # Check for achievements
    await check_and_award_achievements(entry.user_id)
    
    return entry

@api_router.get("/mood-diary/{user_id}")
async def get_user_mood_diary(user_id: str, limit: int = 50):
    """Get user's mood diary entries"""
    entries = await db.mood_diary_entries.find({"user_id": user_id}).sort("created_at", -1).limit(limit).to_list(limit)
    return [MoodDiaryEntry(**entry) for entry in entries]

# Leaderboard endpoint
@api_router.get("/leaderboard")
async def get_zen_coin_leaderboard(limit: int = 10):
    """Get Zen Coin leaderboard"""
    users = await db.user_profiles.find().sort("zen_coins", -1).limit(limit).to_list(limit)
    leaderboard = []
    for i, user in enumerate(users, 1):
        leaderboard.append({
            "rank": i,
            "username": user["username"],
            "zen_coins": user["zen_coins"],
            "total_sessions": user.get("total_sessions", 0),
            "consecutive_days": user.get("consecutive_days", 0)
        })
    return leaderboard

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    """Initialize default data on startup"""
    await initialize_default_data()
    logger.info("Default achievements and courses initialized")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
