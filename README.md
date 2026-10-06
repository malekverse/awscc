# AWS Cloud Club ISIMS

> **Version:** 0.1.0 | **Live:** [awscc-isims.vercel.app](https://awscc-isims.vercel.app)

A full-stack web platform for the **AWS Cloud Club ISIMS** — a student-led cloud computing club at ISIMS university in Tunisia. The platform serves as the club's official digital hub, combining a public-facing website, a paid-member dashboard, and a full admin panel for managing all aspects of the club.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [Features](#features)
  - [Public Website](#public-website)
  - [Member Dashboard](#member-dashboard)
  - [Admin Dashboard](#admin-dashboard)
- [API Routes](#api-routes)
- [Database Models](#database-models)
- [External Integrations](#external-integrations)
- [Security & Authentication](#security--authentication)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Related Documentation](#related-documentation)

---

## Overview

AWS Cloud Club ISIMS is a student-led community at ISIMS university dedicated to cloud computing, artificial intelligence, DevOps, and AWS technologies. This platform provides:

- A **public marketing website** with a landing page, contact form, and legal pages
- A **membership application flow** that submits to Google Sheets, MongoDB, and sends a welcome email
- A **member dashboard** with learning resources, video courses, event registration, and certificates
- A **full admin dashboard** for CRUD management of members, events, resources, video courses, certifications, and emails
- **AI-powered email responses** via Groq/Llama 3.3
- **AWS S3 integration** for organized file storage with presigned URL downloads
- **Event registration** with capacity tracking
- **Internationalization** (French, English, Arabic)
- **Dark/light theme** support

---

## Tech Stack

### Core
| Technology | Purpose |
|---|---|
| **Next.js 14.2.16** (App Router) | React framework with server components & route handlers |
| **React 18** | UI library |
| **TypeScript** (strict mode, ES6) | Type safety |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui** (Radix UI primitives) | 55+ accessible UI components |

### Backend & Database
| Technology | Purpose |
|---|---|
| **MongoDB** / **Mongoose 8** | Primary database |
| **JWT** (`jsonwebtoken`) | Authentication tokens |
| **bcryptjs** | Password hashing |
| **AWS S3** (SDK v3) | File storage & presigned URLs |
| **Nodemailer** | Transactional emails |
| **Groq SDK** (Llama 3.3 70B) | AI-generated email responses |
| **Google Sheets API** | Secondary membership data store |

### UI & Animation
| Technology | Purpose |
|---|---|
| **Framer Motion** | Page & component animations |
| **Recharts** | Admin analytics charts |
| **Lucide React** | Icon library (200+) |
| **Embla Carousel** | Carousel components |
| **Sonner** | Toast notifications |
| **Zod** + **react-hook-form** | Form validation |

### Analytics & SEO
| Technology | Purpose |
|---|---|
| **Vercel Analytics** | Traffic analytics |
| **JSON-LD** (schema-dts) | Structured data |
| **Dynamic sitemap** | SEO indexing |
| **Open Graph tags** | Social sharing |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  ┌───────────────────┐  ┌──────────────────────────────┐   │
│  │   Server Components│  │   Client Components          │   │
│  │   (Public pages)   │  │   (Dashboards, Forms)        │   │
│  └─────────┬─────────┘  └──────────────┬───────────────┘   │
│            │                            │                    │
│  ┌─────────▼────────────────────────────▼───────────────┐   │
│  │              API Route Handlers (app/api/*)           │   │
│  │    Auth  │  CRUD  │  Analytics  │  Email  │  Files    │   │
│  └─────────┬────────────────────────────┬───────────────┘   │
│            │                            │                    │
├────────────┼────────────────────────────┼───────────────────┤
│            ▼                            ▼                    │
│  ┌─────────────────┐  ┌──────────────────────────────┐      │
│  │    MongoDB       │  │   AWS S3 + Google Sheets     │      │
│  │  (Mongoose 8)    │  │   + Groq AI + SMTP Email     │      │
│  └─────────────────┘  └──────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

- **App Router:** File-system-based routing for both pages and API routes
- **Mixed rendering:** Server components for public pages, client components for interactive dashboards
- **Singleton DB connection:** `lib/mongodb.ts` manages a cached Mongoose connection
- **Two-tier auth:** Separate JWT strategies for admins (Bearer + cookie) and members (cookie)
- **External data sync:** Membership forms write to MongoDB and Google Sheets simultaneously

---

## Directory Structure

```
awscc/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page (Hero, About, Features, Contact)
│   ├── layout.tsx                # Root layout (fonts, providers, analytics)
│   ├── globals.css               # Tailwind + CSS variables + dark mode
│   ├── not-found.tsx             # Custom 404
│   ├── sitemap.ts                # Dynamic sitemap
│   │
│   ├── join/                     # Membership application form
│   ├── login/                    # Member login
│   ├── dashboard/                # Member dashboard (protected)
│   ├── forgot-password/          # Password reset request
│   ├── reset-password/           # Password reset with token
│   ├── video-courses/[id]/       # Video course detail
│   │
│   ├── admin/
│   │   ├── login/                # Admin login
│   │   └── dashboard/            # Admin panel (CRUD + analytics + email)
│   │
│   ├── atnc/oc/join/             # ATNC Organizing Committee signup
│   ├── conditions-utilisation/   # Terms of Service (FR)
│   ├── politique-de-confidentialite/  # Privacy Policy (FR)
│   │
│   └── api/                      # Route handlers
│       ├── auth/                 # Member auth (login, logout, me, reset)
│       ├── admin/                # Admin endpoints (CRUD, analytics, email)
│       ├── contact/              # Contact form (AI-generated response)
│       ├── events/               # Public event listing + registration
│       ├── resources/            # Public resource listing
│       ├── video-courses/        # Public video course listing
│       ├── submit-form/          # Membership form -> Sheets + DB + email
│       └── submit-oc-form/       # OC form -> Sheets + DB + email
│
├── components/                   # React components
│   ├── ui/                       # 55 shadcn/ui primitives
│   ├── header.tsx / footer.tsx   # Layout shell
│   ├── hero-section.tsx          # Landing page sections
│   ├── contact-form.tsx          # Contact form
│   └── ...                       # Dashboard tables, modals, charts
│
├── contexts/                     # React contexts
│   ├── theme-context.tsx         # Dark/light theme
│   └── language-context.tsx      # i18n (fr, en, ar)
│
├── hooks/                        # Custom hooks
│   ├── use-mobile.ts             # Mobile detection
│   ├── use-scroll-spy.tsx        # Scroll tracking
│   └── use-toast.ts              # Toast notifications
│
├── lib/                          # Core library
│   ├── mongodb.ts                # Mongoose connection singleton
│   ├── auth.ts                   # JWT, bcrypt, auth helpers
│   ├── aws-s3.ts                 # S3 upload, delete, presigned URLs
│   ├── email-service.ts          # Nodemailer + Groq AI email service
│   └── utils.ts                  # cn() utility
│
├── models/                       # Mongoose schemas
│   ├── Member.ts                 # Club member
│   ├── Admin.ts                  # Admin user (super_admin / admin)
│   ├── AdminLog.ts               # Admin audit log
│   ├── Event.ts                  # Event + registration
│   ├── Resource.ts               # Learning resource
│   ├── VideoCourse.ts            # Video course
│   ├── Certification.ts          # Certification + MemberCertification
│   └── OCTeamMember.ts           # ATNC OC member
│
├── scripts/                      # CLI utilities
│   ├── create-admin.js           # Seed admin user
│   ├── create-admin-simple.js    # Simplified seed
│   └── ...                       # Debug, test, setup scripts
│
├── types/                        # TypeScript type definitions
│   └── dashboard.ts              # Dashboard interfaces
│
├── public/                       # Static assets (logos, favicon, robots.txt)
└── styles/                       # Additional global styles
```

---

## Features

### Public Website

| Feature | Description |
|---|---|
| **Landing Page** | Hero section, About, Features/Activities, Projects showcase, Gallery, Contact |
| **Membership Join** | Multi-step validated form (interests, experience, preferences) → Google Sheets + MongoDB + welcome email |
| **Video Courses** | Public listing with difficulty levels, thumbnails, and detail pages |
| **Contact Form** | Submissions trigger AI-generated email responses via Groq/Llama 3.3 |
| **Legal Pages** | Terms of Service and Privacy Policy (French) |
| **ATNC OC Signup** | Dedicated signup for AWS Tunisian National Camp Organizing Committee |
| **SEO** | Dynamic metadata, sitemap, JSON-LD structured data, Open Graph, robots.txt |

### Member Dashboard

*Requires login with valid email/password and active paid membership.*

| Feature | Description |
|---|---|
| **Profile** | View personal info and membership status |
| **Events** | Browse upcoming events, register or cancel registration |
| **Certifications** | View earned certificates (course, workshop, challenge, certification) |
| **Video Courses** | Browse with difficulty badges, progress tracking |
| **Resources** | Download learning materials via AWS S3 presigned URLs |
| **Account** | Change password, theme toggle (dark/light) |

### Admin Dashboard

*Requires admin login (super_admin or admin role). All actions are audit-logged.*

| Feature | Description |
|---|---|
| **Members** | Full CRUD, bulk operations, payment status management, CSV export |
| **Events** | Create/edit/delete events, view registered attendees, capacity management |
| **Resources** | Upload files to S3 with category tags, manage links and documents |
| **Video Courses** | CRUD with YouTube/Vimeo/direct upload/embed support |
| **Certifications** | Define certification types, assign to members |
| **Analytics** | Charts (Recharts): registration trends, payment breakdown, monthly comparisons, organization stats |
| **Email** | Send individual/bulk emails, bulk-email reminders, welcome emails with credentials |
| **Audit Log** | All admin actions tracked in MongoDB AdminLog collection |

---

## API Routes

### Authentication
| Route | Method | Description |
|---|---|---|
| `/api/auth/login` | POST | Member login |
| `/api/auth/logout` | POST | Member logout |
| `/api/auth/me` | GET | Current member info |
| `/api/auth/forgot-password` | POST | Request reset token |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/change-password` | POST | Change password (authenticated) |

### Admin
| Route | Method | Description |
|---|---|---|
| `/api/admin/login` | POST | Admin login |
| `/api/admin/logout` | POST | Admin logout |
| `/api/admin/auth` | GET | Verify admin token |
| `/api/admin/members` | GET/POST | List / create members |
| `/api/admin/members/[id]` | GET/PUT/DELETE | Single member CRUD |
| `/api/admin/members/bulk` | POST | Bulk member operations |
| `/api/admin/events` | GET/POST | List / create events |
| `/api/admin/events/[id]` | GET/PUT/DELETE | Single event CRUD |
| `/api/admin/resources` | GET/POST | List / create resources |
| `/api/admin/resources/[id]` | GET/PUT/DELETE | Single resource CRUD |
| `/api/admin/video-courses` | GET/POST | List / create video courses |
| `/api/admin/video-courses/[id]` | GET/PUT/DELETE | Single video course CRUD |
| `/api/admin/certifications` | GET/POST | List / create certifications |
| `/api/admin/certifications/[id]` | GET/PUT/DELETE | Single certification CRUD |
| `/api/admin/member-certifications` | GET/POST | Assign certifications |
| `/api/admin/analytics` | GET | Dashboard analytics |
| `/api/admin/export` | GET | Data export |
| `/api/admin/send-emails` | POST | Send individual/bulk emails |
| `/api/admin/bulk-email-reminder` | POST | Bulk email reminders |

### Public
| Route | Method | Description |
|---|---|---|
| `/api/events` | GET | Public event listing |
| `/api/resources` | GET | Public resource listing |
| `/api/video-courses` | GET | Public video course listing |
| `/api/contact` | POST | Submit contact form (AI response) |
| `/api/submit-form` | POST | Membership form submission |
| `/api/submit-oc-form` | POST | OC team form submission |

---

## Database Models

| Model | Key Fields |
|---|---|
| **Member** | name, email, password, phone, interests, experience, meetingPreference, paymentStatus, isActive, isPaid |
| **Admin** | name, email, password, role (super_admin \| admin), lastLogin |
| **AdminLog** | adminId, action, target, targetId, details, timestamp |
| **Event** | title, description, date, location, capacity, registrations[] |
| **Resource** | title, type (link\|document\|video), url, fileKey, category, description |
| **VideoCourse** | title, description, videoType, videoUrl, thumbnailUrl, difficulty, duration, order |
| **Certification** | name, type, description, issuingOrganization, issueDate |
| **MemberCertification** | memberId, certificationId, earnedDate, status |
| **OCTeamMember** | name, email, phone, university, department, motivation, skills |

---

## External Integrations

### AWS S3
- Organized bucket folders: `resources/`, `events/`, `members/`, `admin/`, `certifications/`
- Presigned URLs for secure resource downloads
- Configured in `lib/aws-s3.ts`

### Google Sheets
- Secondary data store for membership and OC team applications
- Service account authentication
- Config scripts in `scripts/setup-google-sheet.js` and `scripts/setup-oc-google-sheet.js`

### Groq AI (Llama 3.3 70B)
- Generates personalized email responses for contact form submissions
- Used in `lib/email-service.ts`

### SMTP Email (Nodemailer)
- Gmail SMTP for transactional emails
- Templates: welcome email with credentials, password reset, contact response, bulk announcements

---

## Security & Authentication

- **Two-tier JWT authentication:** separate strategies for admins and members
- **Admin roles:** `super_admin` (full access) and `admin` (limited)
- **Password hashing:** bcryptjs with salt rounds
- **HTTP-only cookies** for token storage
- **Security headers:** X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
- **No `X-Powered-By`** header
- **Admin audit logging** for all CRUD actions
- **Input validation:** Zod schemas on all forms
- **Protected routes:** middleware or client-side redirects for `/dashboard` and `/admin/dashboard`

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `AWS_ACCESS_KEY_ID` | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key |
| `AWS_REGION` | AWS region |
| `AWS_S3_BUCKET_NAME` | S3 bucket name |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account |
| `GOOGLE_PRIVATE_KEY` | Google private key |
| `GOOGLE_SHEET_ID` | Google Sheet ID |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_SECURE` | SMTP secure flag |
| `EMAIL_USER` | SMTP user |
| `EMAIL_PASSWORD` | SMTP password |
| `GROQ_API_KEY` | Groq AI API key |
| `JWT_SECRET` | JWT signing secret |
| `NEXT_PUBLIC_BASE_URL` | Public base URL |

See `.env.local.example` for the full template.

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy and fill environment variables
cp .env.local.example .env.local

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

### Seed Admin User

```bash
npm run create-admin
# or
npm run create-admin-simple
```

---

## Scripts

| Script | Purpose |
|---|---|
| `npm run create-admin` | Create an admin user in MongoDB |
| `npm run create-admin-simple` | Simplified admin creation |
| `node scripts/check-mongodb.js` | Test MongoDB connection |
| `node scripts/setup-google-sheet.js` | Configure Google Sheets for members |
| `node scripts/setup-oc-google-sheet.js` | Configure Google Sheets for OC team |
| `node scripts/test-google-sheets.js` | Test Google Sheets integration |
| `node scripts/create-test-member.js` | Create a test member |

---

## Related Documentation

| File | Content |
|---|---|
| `README-ADMIN-SETUP.md` | Admin setup guide |
| `README-AWS-S3-ORGANIZATION.md` | S3 folder structure & configuration |
| `README-EMAIL-SYSTEM.md` | Email service setup |
| `README-GOOGLE-SHEETS.md` | Google Sheets integration |
| `README-MONGODB.md` | MongoDB setup |
| `README-OC-TEAM.md` | OC team configuration |
| `TECHNICAL_DOCUMENTATION.md` | Technical architecture deep-dive |
| `COMPLETE_PROFESSIONAL_DOCUMENTATION.md` | Full professional documentation |
| `SEO-GUIDELINES.md` | SEO best practices for the site |

---

## License

Private — AWS Cloud Club ISIMS. All rights reserved.
