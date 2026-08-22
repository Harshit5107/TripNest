# 🌍 GlobeTrotter — 3D Personalized Travel Planning Platform

> **Hackathon Edition:** Built for **Odoo Hackathon 2026**

GlobeTrotter is an end-to-end, personalized travel planning platform that helps users **discover destinations, build multi-city itineraries, manage activities, track budgets, visualize journeys, and share trips** from a single application.

The platform combines a **MySQL relational database**, **Node.js/Express REST API**, **React 18 + Vite**, and an interactive **Three.js/WebGL 3D Earth Globe**.

---

## ✨ Why GlobeTrotter?

Planning a multi-city trip often requires switching between multiple applications for destinations, activities, dates, budgets, maps, and itinerary management.

**GlobeTrotter brings these workflows together in one platform.**

### Our vision

> **Dream → Discover → Plan → Budget → Explore → Share**

The goal is to make travel planning simple, visual, personalized, and collaborative.

---

## 🚀 Key Highlights

- 🌍 Interactive **3D Earth Globe**
- 🤖 **AI Trip Assistant** for automated itinerary generation
- 🗺️ Multi-city itinerary planning
- 📅 Day-by-day itinerary and calendar timeline
- 🔎 City and activity discovery
- 💰 Automated trip budget calculations
- 📊 Interactive financial analytics
- 💱 Multi-currency conversion
- 🎒 Smart packing-list generation
- 🔗 Public trip sharing
- 📋 Copy shared trips into your own account
- ❤️ Favorite destinations
- 👤 User profiles and travel personas
- 🔐 JWT authentication
- 🛠️ Admin analytics dashboard
- 📱 Responsive UI for desktop and mobile

---

# 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 | Component-based UI |
| Build Tool | Vite | Fast development and production builds |
| Styling | Tailwind CSS | Responsive styling |
| UI Design | Glassmorphism | Dark/luxe visual experience |
| 3D | Three.js + WebGL | Interactive Earth Globe |
| Backend | Node.js | Server-side runtime |
| API | Express.js | RESTful API |
| Database | MySQL 8.0 | Relational data storage |
| DB Driver | mysql2/promise | MySQL connectivity |
| Charts | Recharts | Budget and analytics visualization |
| Authentication | JWT | User authentication |
| State Management | React Context | Application state |
| Deployment | Vercel | Application deployment |

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────────┐
                    │       User / Client     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ React 18 + Vite         │
                    │ Tailwind + Three.js     │
                    │ Recharts + React Context│
                    └────────────┬────────────┘
                                 │
                              REST API
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ Node.js + Express.js    │
                    │                         │
                    │ Auth / CRUD / Budget    │
                    │ AI Trip Generation      │
                    │ Sharing / Analytics     │
                    └────────────┬────────────┘
                                 │
                            mysql2/promise
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       MySQL 8.0         │
                    │                         │
                    │ Users                   │
                    │ Cities                  │
                    │ Activities              │
                    │ Trips                   │
                    │ Trip Stops              │
                    │ Stop Activities         │
                    │ Favorites               │
                    └─────────────────────────┘
```

---

# 🗄️ Database Design

GlobeTrotter uses a **normalized MySQL relational database** named `globetrotter`.

The database is designed around relationships between users, trips, cities, stops, and activities.

## Main Tables

### 1. `users`

Stores user authentication, profile, role, and travel-persona information.

Important fields:

- `id`
- `name`
- `email`
- `password`
- `role`
- `avatar`
- `bio`
- `travel_style`

---

### 2. `cities`

Stores destination information.

Important fields:

- `name`
- `country`
- `region`
- `cost_index`
- `avg_cost_per_day`
- `popularity_rating`
- `safety_index`
- `latitude`
- `longitude`

The platform includes pre-seeded global cities and supports dynamic city creation.

---

### 3. `activities`

Stores experiences associated with a city.

Examples:

- Sightseeing
- Food
- Adventure
- Nightlife

Each activity belongs to a city through:

```text
activities.city_id → cities.id
```

---

### 4. `trips`

Stores user-created itineraries.

Each trip belongs to a user:

```text
trips.user_id → users.id
```

Trips contain:

- title
- description
- start date
- end date
- target budget
- visibility
- status
- share slug

---

### 5. `trip_stops`

Represents the cities included in a particular trip.

This table allows one trip to contain multiple cities while maintaining their order.

```text
trips
  │
  └── trip_stops
        │
        └── cities
```

It also stores:

- arrival date
- departure date
- stay cost
- transport cost
- stop order

---

### 6. `stop_activities`

Connects activities to specific trip stops.

It stores:

- scheduled day
- scheduled time
- activity cost
- notes

This allows the application to build detailed day-by-day itineraries.

---

### 7. `user_favorites`

Stores destinations saved by users.

A unique constraint prevents the same user from saving the same city multiple times.

```text
UNIQUE(user_id, city_id)
```

---

# 🔗 Database Relationships

```text
Users
  │
  └──────────────< Trips
                     │
                     └──────────────< Trip Stops >──────────── Cities
                                           │
                                           │
                                           └──────< Stop Activities >──── Activities
                                                                                 │
                                                                                 └── Cities

Users
  │
  └──────────────< User Favorites >──────────── Cities
```

### Why MySQL?

MySQL was selected because GlobeTrotter contains highly structured and interconnected data.

For example:

- One user can create many trips.
- One trip can contain many cities.
- One city can contain many activities.
- One stop can contain multiple scheduled activities.
- Users can save multiple favorite cities.

Using **primary keys, foreign keys, unique constraints, and cascading relationships** helps maintain data integrity and makes complex travel data easier to query and manage.

---

# 🌟 Application Features

## 1. 🔐 Login & Signup

Users can create accounts and securely access their personal travel data.

Features:

- Email/password authentication
- JWT authentication
- Basic validation
- Forgot-password flow
- Quick demo login

---

## 2. 🌍 Interactive 3D Earth

The dashboard features a photorealistic interactive Earth built using:

- Three.js
- WebGL
- Globe textures
- Atmospheric effects
- City markers
- Animated flight arcs

Users can rotate and explore the globe interactively.

---

## 3. 🤖 AI Trip Assistant

The AI Trip Assistant can generate a multi-city itinerary based on:

- User prompt
- Travel persona/vibe
- Trip duration
- Target budget
- Destination preferences

This converts a simple travel request into a structured trip plan.

---

## 4. ✈️ Create Trip Wizard

Users can create a trip by entering:

- Trip name
- Start date
- End date
- Description
- Target budget
- Cover image
- Initial destinations

---

## 5. 🧳 My Trips

Users can manage their trips through categories such as:

- Upcoming
- Completed
- Draft

Each trip can be viewed, edited, searched, or deleted.

---

## 6. 🗺️ Itinerary Builder

The itinerary builder allows users to:

- Add cities
- Reorder stops
- Set arrival/departure dates
- Add activities
- Assign activities to days
- Set transportation costs
- Set stay costs
- Add notes

---

## 7. 📅 Visual Itinerary

The completed itinerary can be viewed as a day-by-day timeline.

Each day displays:

- City
- Activities
- Time
- Duration
- Activity cost
- Daily schedule

---

## 8. 🔎 City Search

Users can search for global destinations.

The platform provides information such as:

- Country
- Region
- Cost index
- Popularity
- Safety
- Average daily cost
- Location

The system supports pre-seeded cities and dynamic city creation.

---

## 9. 🎯 Activity Search

Activities can be filtered by:

- Category
- Cost
- Duration
- Rating

Categories include:

- Sightseeing
- Food
- Adventure
- Nightlife

---

## 10. 💰 Financial Dashboard

The budget dashboard provides:

- Target budget
- Estimated expenses
- Stay costs
- Transportation costs
- Activity costs
- Expense breakdown
- Interactive charts

Recharts is used to visualize financial information through Pie/Donut and Bar charts.

---

## 11. 💱 Currency Converter

The application supports multiple currencies, including:

- USD
- EUR
- GBP
- JPY
- INR
- AUD
- CAD

---

## 12. 🎒 Smart Packing List

GlobeTrotter generates a categorized packing checklist.

Categories include:

- Essentials
- Electronics
- Footwear
- Personal gear

---

## 13. 🔗 Public Trip Sharing

Users can make trips public and share them using a generated share link.

Other users can view the shared itinerary.

A **Copy Trip to My Account** feature allows users to clone a shared trip into their own account.

---

## 14. ❤️ Favorites

Users can save favorite cities and access them later from their profile.

---

## 15. 👤 User Profile

Users can manage:

- Avatar
- Bio
- Travel style/persona
- Favorite destinations

---

## 16. 📊 Admin Dashboard

Administrators can view platform-level analytics such as:

- Total users
- Active trips
- Popular cities
- User management
- User roles

---

# 🔐 Authentication & Authorization

GlobeTrotter uses **JWT-based authentication**.

The general authentication flow is:

```text
User Login
    ↓
Express Authentication API
    ↓
Credentials Validation
    ↓
JWT Token Generated
    ↓
Frontend Stores Authentication State
    ↓
Protected API Requests
    ↓
Backend Validates JWT
```

The system also supports different user roles, including:

- `user`
- `admin`

---

# 📂 Suggested Project Structure

```text
GlobeTrotter/
│
├── src/
│   ├── components/
│   ├── views/
│   ├── context/
│   ├── services/
│   └── ...
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── db/
│   └── ...
│
├── public/
│
├── package.json
├── vite.config.js
├── vercel.json
├── .env
└── README.md
```

> The exact folder structure may vary depending on the implementation.

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure the following are installed:

- **Node.js 18+**
- **MySQL 8.0+**
- npm
- Git

Alternatively, MySQL can be run using **XAMPP**.

---

## 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd GlobeTrotter
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=globetrotter
DB_PORT=3306

JWT_SECRET=replace_with_a_strong_secret
```

> Never commit your real `.env` file or production credentials to GitHub.

---

## 4. Start MySQL

Make sure MySQL is running on:

```text
127.0.0.1:3306
```

---

## 5. Initialize the Database

Run:

```bash
npm run init-db
```

This creates and initializes the `globetrotter` database.

---

## 6. Start the Application

```bash
npm run dev
```

The application will start the frontend and backend development servers.

### Frontend

```text
http://localhost:3000
```

### Backend Health Check

```text
http://localhost:5000/api/health
```

---

# 🔌 API Overview

The Express backend exposes REST APIs for major application operations.

Example API areas:

```text
/api/auth
/api/trips
/api/cities
/api/activities
/api/favorites
/api/ai/generate-trip
/api/admin
/api/health
```

The exact endpoints may vary based on the implementation.

---

# 🧠 AI Trip Generation Flow

```text
User Prompt
    ↓
Travel Preferences
    ↓
Duration + Budget
    ↓
AI Trip Assistant
    ↓
Destination Selection
    ↓
Activity Selection
    ↓
Itinerary Generation
    ↓
Budget Estimation
    ↓
MySQL Persistence
    ↓
Editable Trip
```

The important part is that AI-generated output becomes **structured application data**, rather than remaining only as plain text.

---

# 💰 Budget Calculation

The estimated trip cost can be represented as:

```text
Total Trip Cost
=
Stay Cost
+ Transportation Cost
+ Activity Costs
+ Other Planned Expenses
```

The resulting data is displayed through interactive charts and budget summaries.

---

# 🌐 Deployment

The application is prepared for deployment using **Vercel**.

## Option 1 — Vercel CLI

Install the CLI:

```bash
npm install -g vercel
```

Then:

```bash
vercel
```

---

## Option 2 — GitHub + Vercel

1. Push the repository to GitHub.
2. Open Vercel.
3. Import the GitHub repository.
4. Configure the required environment variables.
5. Deploy the application.

Example production variables:

```env
DB_HOST=<HOSTED_MYSQL_HOST>
DB_USER=<MYSQL_USER>
DB_PASSWORD=<MYSQL_PASSWORD>
DB_NAME=globetrotter
DB_PORT=3306
JWT_SECRET=<STRONG_RANDOM_SECRET>
```

### Important

Vercel deployment requires a **production-accessible MySQL-compatible database**. A local MySQL instance running on `127.0.0.1` cannot be accessed by the deployed application.

---

# 🔒 Security Notes

For security reasons:

- Do not commit `.env` files.
- Do not expose production database credentials.
- Do not expose real administrator passwords in public repositories.
- Use a strong random `JWT_SECRET`.
- Hash passwords before storing them in production.
- Restrict admin APIs using role-based authorization.
- Use HTTPS in production.

Add this to `.gitignore`:

```gitignore
node_modules/
.env
.env.local
dist/
```

---

# 🎯 Hackathon Value Proposition

GlobeTrotter addresses several real travel-planning problems in a single platform:

| Problem | GlobeTrotter Solution |
|---|---|
| Complex multi-city planning | Interactive itinerary builder |
| Finding destinations | City search + 3D globe |
| Finding activities | Activity search and filtering |
| Budget uncertainty | Automatic cost calculation |
| Difficult schedule management | Calendar and timeline |
| Repetitive trip planning | AI Trip Assistant |
| Sharing itineraries | Public share links |
| Reusing other trips | Copy Trip feature |
| Managing saved destinations | Favorites |
| Lack of visual engagement | Three.js 3D Earth |

---

# 🏆 What Makes GlobeTrotter Different?

GlobeTrotter is not simply a travel-search application.

It combines:

> **AI + 3D Visualization + Relational Data + Itinerary Management + Budget Analytics + Social Sharing**

into one travel-planning ecosystem.

The **MySQL relational model** provides a strong foundation for connecting users, trips, destinations, activities, schedules, and favorites, while the React frontend provides an interactive experience on top of that data.

---

# 🔮 Future Enhancements

Potential future improvements include:

- ✈️ Live flight and hotel APIs
- 🏨 Real-time accommodation availability
- 🗺️ Interactive route optimization
- 🚆 Transport recommendations
- 🌦️ Weather-aware itinerary planning
- 🤖 More advanced AI personalization
- 👥 Real-time collaborative trip planning
- 🔔 Travel reminders and notifications
- 📍 GPS-based trip tracking
- 💳 Real-time booking integration
- 🌐 Offline itinerary access
- 📱 Dedicated mobile application

---

# 👥 Team

**GlobeTrotter — Odoo Hackathon 2026**

Built with ❤️ for smarter and more personalized travel planning.

---

# 📜 License

This project was built for **Odoo Hackathon 2026**.

All rights reserved.
