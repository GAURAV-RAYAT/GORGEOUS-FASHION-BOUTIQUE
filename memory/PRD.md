# Gorgeous Fashion Boutique — PRD

## Problem statement (original)
Build a premium landing page + full website for **गॉर्जियस Fashion Boutique** — a boutique at Govindpuri, Kalkaji, Delhi 110019. Goals: rank on Google, showcase designs (premium feel), convert visitors → WhatsApp / bookings, build luxury brand trust. Reference visual: st-shree.com.

## User personas
- **Walk-in prospect** — browsing sarees/lehengas/gowns; wants to see gallery + talk on WhatsApp.
- **Bride-to-be** — wants to book a private styling appointment.
- **Owner / Admin (3 users)** — uploads photos/reels, views bookings & messages, manages site copy.

## Design system
Burgundy `#6E2C2C` · Beige `#E6C7A8` · Gold `#C8A96A` · Ink `#3A1F1F`
Fonts: Playfair Display (headings) · Hind (body) · Tiro Devanagari Hindi (गॉर्जियस)

## Architecture
- Backend: FastAPI + MongoDB (motor). All routes `/api/*`.
- Frontend: React + Tailwind + Shadcn UI + framer-motion. Routes `/`, `/gallery`, `/book`, `/contact`, `/admin/login`, `/admin`.
- Auth: JWT (bcrypt). 3 admins seeded on startup.
- Media: Cloudinary signed uploads. Frontend uploads direct to Cloudinary after getting signature from backend.
- Email: Resend (contact + booking confirmations, admin notification).
- WhatsApp: wa.me deep links (floating FAB + hero + post-booking).

## What's implemented (2026-04)
- Landing: hero, 3 categories (Saree/Lehenga/Gown arch cards), reels strip, gallery preview, reviews + **public review form (instant publish)**, Instagram CTA, quick contact.
- Gallery page with filter (All/Saree/Lehenga/Gown/Reel), mixes uploaded media + seed images.
- Contact page with form, embedded Google map, **"Get Directions" button to real shop address**.
- Booking page with Shadcn calendar + time slots + category + WhatsApp auto-open on submit.
- Admin login (`/admin/login` — also linked in footer) + dashboard tabs: Upload (Cloudinary), Gallery (delete), Bookings (confirm + WhatsApp), Messages, Settings.
- Floating WhatsApp FAB on public pages.
- Backend: JWT auth, 3 admins, `/cloudinary/signature`, media CRUD, contact (+ email), bookings (+ email), reviews (public POST), settings CRUD.
- Tested: 22/22 backend tests pass; all frontend flows verified end-to-end.

## Backlog / P1
- Real Instagram Graph API auto-sync (currently manual uploads + profile link).
- Image optimization (Cloudinary `q_auto,f_auto` transformations on output URLs).
- SEO meta tags + sitemap for "boutique near me" ranking.
- Multi-image delete & reorder in admin.

## Backlog / P2
- Loyalty / referral codes.
- Multi-language toggle (Hindi / English).
- Pricing / offer banners managed from admin.
