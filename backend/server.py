from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import time
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import resend
import cloudinary
import cloudinary.uploader
import cloudinary.utils

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Query
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# ---------- Setup ----------
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGO = "HS256"

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
NOTIFICATION_EMAIL = os.environ.get("NOTIFICATION_EMAIL", "")

cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True,
)

app = FastAPI(title="Gorgeous Fashion Boutique API")
api = APIRouter(prefix="/api")


# ---------- Models ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    role: str


class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    message: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    read: bool = False


class ContactCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    message: str


class BookingCreate(BaseModel):
    name: str
    phone: str
    email: Optional[EmailStr] = None
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    category: str  # Saree / Lehenga / Gown / Consultation
    notes: Optional[str] = None


class Booking(BookingCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "pending"


class MediaCreate(BaseModel):
    public_id: str
    secure_url: str
    resource_type: str  # image | video
    category: str  # Saree / Lehenga / Gown / Reel
    title: Optional[str] = None
    featured: bool = False


class MediaItem(MediaCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ReviewCreate(BaseModel):
    name: str
    rating: int = Field(ge=1, le=5)
    comment: str


class Review(ReviewCreate):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    approved: bool = True


class HeroSlide(BaseModel):
    image: str = ""
    eyebrow: str = ""
    title: str = ""
    subtitle: str = ""
    cta_label: str = "Book Appointment"
    cta_link: str = "/book"
    align: str = "left"


class SiteSettings(BaseModel):
    tagline: str = "Elegance in Every Thread"
    hero_subtitle: str = "Crafted with love in the heart of Delhi — bespoke sarees, lehengas, and gowns for the moments that matter."
    phone: str = "+91 8587008027"
    email: str = "jiyarayat207@gmail.com"
    address: str = "Govindpuri, Kalkaji Metro No. 08, New Delhi – 110019"
    whatsapp: str = "918587008027"
    instagram_url: str = "https://instagram.com/"
    map_embed: str = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.6194447!2d77.2581853!3d28.5394!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2sGovindpuri%2C%20Kalkaji%2C%20New%20Delhi!5e0!3m2!1sen!2sin!4v1700000000000"
    logo_url: str = "https://customer-assets.emergentagent.com/job_priceless-germain-8/artifacts/a62v7x5o_Screenshot%202026-04-22%20190513.png"
    signature_title: str = "Signature Collection"
    signature_subtitle: str = "New Season 2026"
    hero_slides: List[HeroSlide] = Field(default_factory=lambda: [
        HeroSlide(
            image="https://images.pexels.com/photos/33343580/pexels-photo-33343580.jpeg",
            eyebrow="Bridal Season 2026",
            title="Hand-crafted Lehengas",
            subtitle="Book your private fitting",
            cta_label="Book Appointment",
            cta_link="/book",
            align="left",
        ),
        HeroSlide(
            image="https://images.unsplash.com/photo-1711130388758-2ccf44bb735c",
            eyebrow="Festive Radiance",
            title="Heirloom Sarees & Gowns",
            subtitle="Explore our atelier",
            cta_label="View Gallery",
            cta_link="/gallery",
            align="right",
        ),
    ])


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)


# ---------- Utilities ----------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_access_token(email: str, role: str) -> str:
    payload = {
        "sub": email,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_admin(request: Request) -> dict:
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else None
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid token")

    user = await db.admins.find_one({"email": payload.get("email")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(401, "Admin not found")
    return user


async def send_email_async(to: str, subject: str, html: str):
    if not resend.api_key or not to:
        logger.info(f"[email skipped] to={to} subject={subject}")
        return None
    try:
        params = {"from": SENDER_EMAIL, "to": [to], "subject": subject, "html": html}
        return await asyncio.to_thread(resend.Emails.send, params)
    except Exception as e:
        logger.error(f"Email send failed: {e}")
        return None


def premium_email_wrapper(title: str, body_html: str) -> str:
    return f"""
    <div style="font-family: Georgia, serif; background:#E6C7A8; padding:40px 20px; color:#3A1F1F;">
      <div style="max-width:600px;margin:0 auto;background:#F2DEC6;border:1px solid #C8A96A;padding:40px;">
        <h1 style="color:#6E2C2C;font-size:26px;margin:0 0 6px 0;letter-spacing:1px;">गॉर्जियस Fashion Boutique</h1>
        <p style="color:#6E2C2C;font-style:italic;margin:0 0 24px 0;">Elegance in Every Thread</p>
        <hr style="border:none;border-top:1px solid #C8A96A;margin:0 0 24px 0;" />
        <h2 style="color:#6E2C2C;font-size:20px;margin:0 0 12px 0;">{title}</h2>
        {body_html}
        <hr style="border:none;border-top:1px solid #C8A96A;margin:32px 0 16px 0;" />
        <p style="font-size:12px;color:#5A3A3A;margin:0;">Govindpuri, Kalkaji Metro No. 08, New Delhi – 110019<br/>+91 8587008027 · jiyarayat207@gmail.com</p>
      </div>
    </div>
    """


# ---------- Startup ----------
@app.on_event("startup")
async def startup():
    await db.admins.create_index("email", unique=True)
    await db.media.create_index("created_at")
    await db.bookings.create_index("created_at")
    await db.contact_messages.create_index("created_at")

    # Seed 3 admins
    admins = [
        (os.environ.get("ADMIN1_EMAIL"), os.environ.get("ADMIN1_PASSWORD")),
        (os.environ.get("ADMIN2_EMAIL"), os.environ.get("ADMIN2_PASSWORD")),
        (os.environ.get("ADMIN3_EMAIL"), os.environ.get("ADMIN3_PASSWORD")),
    ]
    for email, pwd in admins:
        if not email or not pwd:
            continue
        existing = await db.admins.find_one({"email": email})
        if not existing:
            await db.admins.insert_one({
                "email": email,
                "password_hash": hash_password(pwd),
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info(f"Seeded admin: {email}")
        elif not verify_password(pwd, existing["password_hash"]):
            await db.admins.update_one({"email": email}, {"$set": {"password_hash": hash_password(pwd)}})
            logger.info(f"Updated admin password: {email}")

    # Seed default site settings
    if not await db.settings.find_one({"_id": "site"}):
        await db.settings.insert_one({"_id": "site", **SiteSettings().model_dump()})

    # Seed a couple sample reviews if none exist
    count = await db.reviews.count_documents({})
    if count == 0:
        samples = [
            Review(name="Priya Sharma", rating=5, comment="My wedding lehenga was absolutely divine — the fit and handwork were flawless!").model_dump(),
            Review(name="Anjali Mehta", rating=5, comment="Saree draping consultation was a dream. Such a warm and elegant boutique.").model_dump(),
            Review(name="Ritu Verma", rating=5, comment="The custom gown design exceeded every expectation. Truly a Gorgeous experience.").model_dump(),
        ]
        await db.reviews.insert_many(samples)


@app.on_event("shutdown")
async def shutdown():
    client.close()


# ---------- Auth ----------
@api.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    user = await db.admins.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_access_token(user["email"], user.get("role", "admin"))
    return TokenResponse(access_token=token, email=user["email"], role=user.get("role", "admin"))


@api.get("/auth/me")
async def me(current: dict = Depends(get_current_admin)):
    return current


@api.post("/auth/change-password")
async def change_password(req: ChangePasswordRequest, current: dict = Depends(get_current_admin)):
    user = await db.admins.find_one({"email": current["email"]})
    if not user or not verify_password(req.current_password, user["password_hash"]):
        raise HTTPException(400, "Current password is incorrect")
    await db.admins.update_one(
        {"email": current["email"]},
        {"$set": {"password_hash": hash_password(req.new_password)}}
    )
    return {"ok": True}


# ---------- Cloudinary ----------
@api.get("/cloudinary/signature")
async def cloudinary_signature(
    resource_type: str = Query("image", pattern="^(image|video)$"),
    folder: str = Query("gorgeous/gallery"),
    current: dict = Depends(get_current_admin),
):
    ALLOWED = ("gorgeous/",)
    if not folder.startswith(ALLOWED):
        raise HTTPException(400, "Invalid folder")

    timestamp = int(time.time())
    params_to_sign = {"timestamp": timestamp, "folder": folder}
    signature = cloudinary.utils.api_sign_request(params_to_sign, os.environ["CLOUDINARY_API_SECRET"])
    return {
        "signature": signature,
        "timestamp": timestamp,
        "cloud_name": os.environ["CLOUDINARY_CLOUD_NAME"],
        "api_key": os.environ["CLOUDINARY_API_KEY"],
        "folder": folder,
        "resource_type": resource_type,
    }


# ---------- Media / Gallery ----------
@api.post("/media", response_model=MediaItem)
async def create_media(data: MediaCreate, current: dict = Depends(get_current_admin)):
    item = MediaItem(**data.model_dump())
    await db.media.insert_one(item.model_dump())
    return item


@api.get("/media", response_model=List[MediaItem])
async def list_media(category: Optional[str] = None, resource_type: Optional[str] = None, featured: Optional[bool] = None):
    q = {}
    if category and category.lower() != "all":
        q["category"] = category
    if resource_type:
        q["resource_type"] = resource_type
    if featured is not None:
        q["featured"] = featured
    docs = await db.media.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.patch("/media/{media_id}")
async def update_media(media_id: str, patch: dict, current: dict = Depends(get_current_admin)):
    allowed = {"featured", "category", "title"}
    clean = {k: v for k, v in patch.items() if k in allowed}
    await db.media.update_one({"id": media_id}, {"$set": clean})
    return {"ok": True}


@api.delete("/media/{media_id}")
async def delete_media(media_id: str, current: dict = Depends(get_current_admin)):
    item = await db.media.find_one({"id": media_id}, {"_id": 0})
    if not item:
        raise HTTPException(404, "Not found")
    try:
        await asyncio.to_thread(
            cloudinary.uploader.destroy,
            item["public_id"],
            resource_type=item.get("resource_type", "image"),
            invalidate=True,
        )
    except Exception as e:
        logger.error(f"Cloudinary destroy failed: {e}")
    await db.media.delete_one({"id": media_id})
    return {"ok": True}


# ---------- Contact ----------
@api.post("/contact")
async def create_contact(data: ContactCreate):
    msg = ContactMessage(**data.model_dump())
    await db.contact_messages.insert_one(msg.model_dump())

    # Admin notification
    admin_body = f"""
      <p><strong>Name:</strong> {msg.name}</p>
      <p><strong>Phone:</strong> {msg.phone}</p>
      <p><strong>Email:</strong> {msg.email or '—'}</p>
      <p><strong>Message:</strong></p>
      <p style="background:#E6C7A8;padding:16px;border-left:3px solid #C8A96A;">{msg.message}</p>
    """
    await send_email_async(NOTIFICATION_EMAIL, "New enquiry — Gorgeous Fashion Boutique",
                           premium_email_wrapper("New Enquiry Received", admin_body))

    # User thank-you
    if msg.email:
        user_body = f"""
          <p>Dear {msg.name},</p>
          <p>Thank you for reaching out to <strong>Gorgeous Fashion Boutique</strong>. We have received your message and our atelier will get back to you very soon.</p>
          <p style="font-style:italic;color:#6E2C2C;">"Elegance in Every Thread"</p>
        """
        await send_email_async(msg.email, "Thank you for contacting Gorgeous Fashion Boutique",
                               premium_email_wrapper("Thank you — we've received your message", user_body))

    return {"ok": True, "id": msg.id}


@api.get("/contact", response_model=List[ContactMessage])
async def list_contact(current: dict = Depends(get_current_admin)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# ---------- Bookings ----------
@api.post("/bookings", response_model=Booking)
async def create_booking(data: BookingCreate):
    booking = Booking(**data.model_dump())
    await db.bookings.insert_one(booking.model_dump())

    admin_body = f"""
      <p><strong>Name:</strong> {booking.name}</p>
      <p><strong>Phone:</strong> {booking.phone}</p>
      <p><strong>Email:</strong> {booking.email or '—'}</p>
      <p><strong>Category:</strong> {booking.category}</p>
      <p><strong>Date:</strong> {booking.date} at {booking.time}</p>
      <p><strong>Notes:</strong> {booking.notes or '—'}</p>
    """
    await send_email_async(NOTIFICATION_EMAIL, "New appointment booking", premium_email_wrapper("New Appointment", admin_body))

    if booking.email:
        user_body = f"""
          <p>Dear {booking.name},</p>
          <p>Your appointment at <strong>Gorgeous Fashion Boutique</strong> has been received.</p>
          <p><strong>When:</strong> {booking.date} at {booking.time}<br/>
             <strong>For:</strong> {booking.category}</p>
          <p>We'll confirm your slot on WhatsApp at {booking.phone} shortly.</p>
        """
        await send_email_async(booking.email, "Appointment received — Gorgeous Fashion Boutique",
                               premium_email_wrapper("Appointment Confirmation", user_body))

    return booking


@api.get("/bookings", response_model=List[Booking])
async def list_bookings(current: dict = Depends(get_current_admin)):
    docs = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.patch("/bookings/{booking_id}")
async def update_booking(booking_id: str, status: str, current: dict = Depends(get_current_admin)):
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": status}})
    return {"ok": True}


# ---------- Reviews ----------
@api.get("/reviews", response_model=List[Review])
async def list_reviews():
    docs = await db.reviews.find({"approved": True}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return docs


@api.get("/reviews/all", response_model=List[Review])
async def list_reviews_all(current: dict = Depends(get_current_admin)):
    docs = await db.reviews.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


@api.post("/reviews", response_model=Review)
async def create_review(data: ReviewCreate):
    r = Review(**data.model_dump())
    await db.reviews.insert_one(r.model_dump())
    return r


@api.patch("/reviews/{review_id}")
async def update_review(review_id: str, patch: dict, current: dict = Depends(get_current_admin)):
    allowed = {"approved", "comment", "rating", "name"}
    clean = {k: v for k, v in patch.items() if k in allowed}
    await db.reviews.update_one({"id": review_id}, {"$set": clean})
    return {"ok": True}


@api.delete("/reviews/{review_id}")
async def delete_review(review_id: str, current: dict = Depends(get_current_admin)):
    await db.reviews.delete_one({"id": review_id})
    return {"ok": True}


# ---------- Settings ----------
@api.get("/settings")
async def get_settings():
    defaults = SiteSettings().model_dump()
    doc = await db.settings.find_one({"_id": "site"})
    if not doc:
        return defaults
    doc.pop("_id", None)
    # Merge: defaults provide any missing new fields added after seed
    return {**defaults, **doc}


@api.patch("/settings")
async def update_settings(patch: dict, current: dict = Depends(get_current_admin)):
    allowed = set(SiteSettings.model_fields.keys())
    clean = {k: v for k, v in patch.items() if k in allowed}
    await db.settings.update_one({"_id": "site"}, {"$set": clean}, upsert=True)
    return await get_settings()


@api.get("/")
async def root():
    return {"service": "Gorgeous Fashion Boutique API", "status": "ok"}


app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
