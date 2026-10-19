# JalRakshak – Public Pipeline Leakage Reporting & Management System

> **Every Drop Matters. Report Water Leaks. Save Water.**

**JalRakshak** is a modern civic-technology and municipal leakage management web application. It empowers citizens to report public water pipeline leaks in real-time, enables field officers to inspect and resolve leaks efficiently, and provides municipal administrators with GIS hotspots and water conservation analytics.

---

## 🌟 Key Features

### 👤 Citizen Role
- **Multi-step Reporting Form:** Report leaks with category, severity, and urgency flags (e.g. traffic obstruction, hospital proximity, contaminated water).
- **Interactive Geospatial Location:** Select and pinpoint leak locations on an interactive Leaflet / OpenStreetMap interface.
- **Live Complaint Tracking:** Track complaint progress step-by-step (`Submitted` → `Under Review` → `Verified` → `Assigned` → `Repair In Progress` → `Resolved`).
- **Transparency & Feedback:** Rate the completed repair and verify side-by-side Before/After repair photos.

### 👷 Field Officer Role
- **Dedicated Officer Dashboard:** View assigned leaks prioritized by severity and proximity.
- **Inspection Management:** Log inspection observations, pipeline causes, and required materials.
- **Repair Status Progression:** Transition reports through scheduling, repair in progress, and resolution.

### 🏛️ Administrator Role
- **Executive Analytics:** Real-time charts covering reports by month, severity, status, and geographic area.
- **Hotspot Detection:** Identify repeated pipeline failures across urban zones.
- **Water Loss & Savings Tracker:** Calculated estimates of water saved across repaired complaints.
- **User Management:** Manage citizens, officers, and administrators.

---

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Icons & Visualization:** Lucide React, Recharts
- **Geospatial Maps:** Leaflet, OpenStreetMap
- **Backend:** Node.js, Express.js, TypeScript
- **Database & ORM:** SQLite / Prisma ORM
- **Authentication:** JWT (JSON Web Tokens) with role-based access control

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or v20+)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/JalRakshak.git
cd JalRakshak
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```
Backend runs at `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Citizen** | `citizen@example.com` | `password123` |
| **Field Officer** | `officer@example.com` | `password123` |
| **Administrator** | `admin@example.com` | `password123` |

---

## 📄 License
This project is open-source and built for civic innovation and water conservation.
