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

# Oasis stats endpoint
@api_router.get("/oasis/stats")
async def get_global_oasis_stats():
    """Get global oasis statistics"""
    return {
        "total_sessions": 1000,
        "total_elements_grown": 25000,
        "active_gardens": 150,
        "collective_breath_cycles": 50000
    }

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
