# 🌍 GlobeTrotter – 3D Personalized Travel Planning Platform

> **Hackathon Edition**: Built for **Odoo Hackathon 2026**. 
> An end-to-end, personalized travel planning platform featuring a **MySQL relational database**, **Node.js/Express REST API**, **React 18 + Vite**, and **Three.js Photorealistic 3D Earth Globe**.

---

## 📌 Project Overview

**GlobeTrotter** empowers travelers to dream, design, and organize multi-city global journeys with ease. It features real-time itinerary building, automated financial budget analytics, interactive day-by-day calendar timelines, public trip sharing, dynamic city search for **ANY** city in the world, and an **AI Trip Assistant** that auto-generates trips on demand.

---

## 🛠️ Tech Stack & Database Used

| Component | Technology Used | Description |
|---|---|---|
| **Database** | **MySQL 8.0** (`mysql2/promise`) | Relational database storing users, cities, activities, trips, stops, schedule matrix, & favorites. |
| **Backend** | **Node.js & Express.js** | RESTful API handling authentication, CRUD operations, budget calculations, and AI trip generation. |
| **Frontend** | **React 18 & Vite** | Modern, fast UI rendering with state management via React Context. |
| **3D Engine** | **Three.js & WebGL** | Photorealistic rotatable 3D Earth Globe with cloud atmosphere, glowing city pins, and animated flight arcs. |
| **Styling** | **Tailwind CSS & Glassmorphism** | Dark/Luxe cyber aesthetic with responsive glassmorphism containers and spring animations. |
| **Charts** | **Recharts** | Financial budget visualization via interactive Pie/Donut & Bar charts. |

---

## 🗄️ MySQL Database Schema (`globetrotter`)

The backend utilizes a normalized **MySQL relational database schema**:

```sql
CREATE DATABASE globetrotter;
USE globetrotter;

-- 1. Users (Auth, Roles, & Personas)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar VARCHAR(255),
  bio TEXT,
  travel_style VARCHAR(100) DEFAULT 'Explorer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cities (Destinations Directory - 66+ Pre-Seeded + Dynamic Auto-Creation)
CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  region VARCHAR(100) NOT NULL,
  cost_index VARCHAR(10) NOT NULL DEFAULT '$$',
  avg_cost_per_day DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
  popularity_rating DECIMAL(3, 2) NOT NULL DEFAULT 4.5,
  safety_index INT DEFAULT 85,
  image_url TEXT,
  description TEXT,
  latitude DECIMAL(10, 6),
  longitude DECIMAL(10, 6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Activities (Experiences, Tours, & Gastronomy)
CREATE TABLE activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  duration_hours DECIMAL(4, 2) NOT NULL DEFAULT 2.0,
  rating DECIMAL(3, 2) DEFAULT 4.8,
  image_url TEXT,
  description TEXT,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- 4. Trips (User Itineraries)
CREATE TABLE trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_budget DECIMAL(10, 2) DEFAULT 1500.00,
  cover_image TEXT,
  visibility ENUM('public', 'private') DEFAULT 'private',
  share_slug VARCHAR(64) UNIQUE,
  status ENUM('draft', 'upcoming', 'completed') DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Trip Stops (Ordered Multi-City Route Sequence)
CREATE TABLE trip_stops (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id INT NOT NULL,
  city_id INT NOT NULL,
  stop_order INT NOT NULL DEFAULT 1,
  arrival_date DATE,
  departure_date DATE,
  stay_cost DECIMAL(10, 2) DEFAULT 0.00,
  transport_cost DECIMAL(10, 2) DEFAULT 0.00,
  notes TEXT,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);

-- 6. Stop Activities (Daily Assigned Experiences)
CREATE TABLE stop_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stop_id INT NOT NULL,
  activity_id INT NOT NULL,
  scheduled_day INT DEFAULT 1,
  scheduled_time VARCHAR(20) DEFAULT '10:00 AM',
  cost DECIMAL(10, 2) DEFAULT 0.00,
  notes TEXT,
  FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- 7. User Favorites (Saved Cities)
CREATE TABLE user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  city_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE KEY user_city_fav (user_id, city_id)
);
```

---

## 🌟 Key Application Features

1. **Login & Signup (`AuthModal.jsx`)**:
   - JWT authentication + ⚡ Quick Demo Login preset buttons.
2. **Dashboard & 3D Earth Globe (`DashboardView.jsx` & `Globe3D.jsx`)**:
   - Interactive Three.js Earth with continental textures, atmospheric glow, glowing city pins, and animated flight arcs.
3. **✨ AI Trip Assistant Generator (`/api/ai/generate-trip`)**:
   - Auto-generates multi-city trip itineraries based on user prompt, vibe persona, duration, and target budget.
4. **Create Trip Wizard (`CreateTripModal.jsx`)**:
   - Form to initiate trip with date ranges, budget target, cover banner picker, and initial cities.
5. **My Trips List (`MyTripsView.jsx`)**:
   - Filterable itinerary management (Upcoming, Completed, Draft) with search bar.
6. **Itinerary Builder (`ItineraryBuilderView.jsx`)**:
   - Drag/reorder city stops, edit stay/transport costs, and assign activities to specific days.
7. **Visual Itinerary View (`ItineraryViewScreen.jsx`)**:
   - Day-by-day timeline view with city headers and activity cost breakdowns.
8. **City Search for ANY City (`CitySearchScreen.jsx`)**:
   - Search 66+ seeded global cities OR auto-create **ANY city in the world** with dynamic photo matching!
9. **Activity Search (`ActivitySearchScreen.jsx`)**:
   - Filter experiences by category (Sightseeing, Food, Adventure, Nightlife) with price range sliders.
10. **Financial Dashboard & Currency Converter (`TripBudgetScreen.jsx`)**:
    - Interactive Pie & Bar charts using Recharts + Live Currency Converter (**USD, EUR, GBP, JPY, INR, AUD, CAD**) + CSV Export.
11. **🎒 Smart Packing List Generator (`TripBudgetScreen.jsx`)**:
    - Real-time packing checklist categorized by Essentials, Electronics, Footwear, and Personal gear.
12. **Trip Calendar Timeline (`TripTimelineScreen.jsx`)**:
    - 14-day calendar grid displaying multi-day city stops and daily schedule blocks.
13. **Public Sharing & Copy Trip (`SharedItineraryScreen.jsx`)**:
    - Sharable public links with a **"Copy Trip to My Account"** cloning button.
14. **User Profile & Favorites (`UserProfileScreen.jsx`)**:
    - Avatar selector, travel persona settings, and saved favorite destinations list.
15. **Admin Analytics Dashboard (`AdminDashboardScreen.jsx`)**:
    - Platform metrics (Total Users, Active Trips, Top Cities Chart, User Management Table with role toggling).

---

## 🔑 Demo Account Credentials

| Role | Email | Password |
|---|---|---|
| **Platform Administrator** | `hbhalani937@gmail.com` | `Kano@5107` |
| **Admin Manager (Secondary)** | `admin@globetrotter.com` | `password123` |
| **Demo Traveler** | `alex@globetrotter.com` | `password123` |

---

## 💻 Local Setup & Execution Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+ or XAMPP MySQL)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize MySQL Database
Make sure MySQL is running on `127.0.0.1:3306` (`root` user without password, or set `.env` variables), then execute:
```bash
npm run init-db
```

### Step 3: Run Fullstack Application
```bash
# Run Express backend server & Vite React frontend concurrently
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🚀 How to Deploy on Vercel

The project is pre-configured with `vercel.json` for instant deployment on **Vercel**!

### Method 1: Using Vercel CLI (Recommended)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy to Vercel:
   ```bash
   vercel
   ```

### Method 2: Deploying via GitHub & Vercel Dashboard
1. Push this codebase repository to **GitHub**.
2. Log into [Vercel Dashboard](https://vercel.com).
3. Click **"New Project"** -> Import your GitHub repository.
4. Set Environment Variables on Vercel:
   - `DB_HOST`: Your hosted MySQL Database host (e.g. PlanetScale, Supabase MySQL, Railway, or Aiven MySQL)
   - `DB_USER`: Your MySQL username
   - `DB_PASSWORD`: Your MySQL password
   - `DB_NAME`: `globetrotter`
   - `JWT_SECRET`: `globetrotter_super_secret_key_2026`
5. Click **Deploy**! Vercel will automatically build the Vite React frontend and deploy the Node/Express backend handlers.

---

## 📄 License

Built for Odoo Hackathon 2026. All rights reserved.
#   T r i p N e s t  
 