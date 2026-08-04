# ⚡ Type Rush — Modern Real-Time Typing Competition Platform

**Type Rush** is a full-stack, enterprise-grade typing competition platform engineered for colleges, universities, and tech hackathons. It features a mobile-first student registration flow, a precision typing test engine, multi-layered anti-cheat security, real-time Socket.IO leaderboards, interactive analytics, and an administrative command center.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technologies & Libraries |
| :--- | :--- |
| **Backend API** | Node.js, Express.js, Socket.IO, Mongoose, MongoDB, BcryptJS, JSON Web Tokens (JWT), Helmet, CORS, Express Rate Limit, Zod |
| **Student Portal** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios, Socket.IO Client, Canvas-Confetti, React Router DOM |
| **Admin Panel** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts, QRCode.React, Axios, Socket.IO Client, React Router DOM |

---

## 📂 Project Monorepo Folder Structure

```
Type Rush/
├── backend/                  # Node.js + Express REST API & Socket.IO Server
│   ├── src/
│   │   ├── config/           # Database configuration (db.js)
│   │   ├── controllers/      # API Controllers (Auth, Events, Students, Paragraphs, Results, AntiCheat, Analytics)
│   │   ├── middleware/       # Auth guard, error handling, rate limiting
│   │   ├── models/           # Mongoose models (Admin, Event, Student, Paragraph, Result, Log)
│   │   ├── routes/           # REST API Route definitions
│   │   ├── utils/            # JWT & Event Code generators
│   │   └── server.js         # HTTP Server entry point
│   ├── .env                  # Backend environment configuration
│   └── package.json
│
├── student-portal/           # Student Mobile & Desktop Web Application
│   ├── src/
│   │   ├── components/       # Header, LoadingScreen, SkeletonLoader
│   │   ├── context/          # ThemeContext (Dark/Light Mode)
│   │   ├── hooks/            # useAntiCheat security hook
│   │   ├── pages/            # Home, Register, TypingArena, ResultView, NotFound
│   │   └── services/         # Axios API Client
│   ├── index.html
│   └── vite.config.js
│
├── admin-portal/             # Admin Command Center Web Application
│   ├── src/
│   │   ├── components/       # AdminHeader, AdminSidebar
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── pages/            # Dashboard, Events, Participants, Leaderboard, Paragraphs, Analytics, Reports, Settings
│   │   └── services/         # Axios API Client & Socket.IO Service
│   ├── index.html
│   └── vite.config.js
│
├── package.json              # Monorepo root scripts
└── README.md
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/typerush`) or MongoDB Atlas URI

### 2. Installation
Install dependencies for all monorepo projects simultaneously:
```bash
npm run install:all
```

### 3. Launch Development Servers
Run backend, student portal, and admin portal concurrently:
```bash
npm run dev
```

Default local service ports:
- **Backend API**: `http://localhost:5000`
- **Student Portal**: `http://localhost:5173`
- **Admin Command Center**: `http://localhost:5174`

---

## 🔑 Default Credentials

- **Admin Portal Email**: `admin@typerush.com`
- **Admin Portal Password**: `admin123`

*(Default admin account is auto-provisioned upon first server startup if database is empty)*

---

## 🧮 Score Calculation & Anti-Cheat Rules

### Official Score Formula
$$\text{Final Score} = \max\left(0, \text{Math.round}((\text{Net WPM} \times 10) + \text{Accuracy \%} - (\text{Mistakes} \times 5))\right)$$

### Anti-Cheat 3-Warning Rule
1. **Warning 1**: Tab switch / window focus loss alert modal.
2. **Warning 2**: Critical warning alert modal.
3. **Warning 3**: **Immediate Disqualification & Auto-Submission** recorded in audit logs.

---

## 📡 REST API Reference

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Public | System & Database Health check |
| `/api/v1/auth/login` | `POST` | Public | Admin login & JWT token issue |
| `/api/v1/auth/me` | `GET` | Admin | Validate current admin session |
| `/api/v1/events` | `POST/GET` | Admin | Create event & list competition events |
| `/api/v1/events/code/:code` | `GET` | Public | Student event code lookup |
| `/api/v1/events/:id/status` | `PATCH` | Admin | Toggle event status (`draft` $\rightarrow$ `active` $\rightarrow$ `completed`) |
| `/api/v1/students/register` | `POST` | Public | Student mobile registration |
| `/api/v1/paragraphs/random` | `GET` | Public | Fetch random typing passage by difficulty |
| `/api/v1/paragraphs/bulk-import` | `POST` | Admin | Bulk JSON array paragraph import |
| `/api/v1/anti-cheat/log-warning` | `POST` | Public | Log security violation warning |
| `/api/v1/results/submit` | `POST` | Public | Submit typing test & recalculate rankings |
| `/api/v1/results/leaderboard/:eventId` | `GET` | Public | Fetch live competition leaderboard |
| `/api/v1/dashboard/stats` | `GET` | Admin | Real-time aggregate metric counters |
| `/api/v1/analytics/charts` | `GET` | Admin | Recharts aggregation datasets |
| `/api/v1/analytics/export` | `GET` | Admin | Full dataset payload for 1-click CSV/JSON export |

---

## ⚡ Socket.IO Real-Time Events

- `join_event`: Join event Socket.IO room for live updates.
- `new_registration`: Emits registration alert to live admin dashboard.
- `test_completed`: Emits test completion notification with WPM & rank.
- `leaderboard_update`: Triggers zero-reload ranking refresh.
- `anti_cheat_alert`: Emits real-time security warning alert.

---

## 🛠️ Production Build Verification

To verify production bundle compilation for Student Portal and Admin Panel:
```bash
npm run build
```
