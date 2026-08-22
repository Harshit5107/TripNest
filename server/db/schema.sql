CREATE DATABASE IF NOT EXISTS globetrotter;
USE globetrotter;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  avatar VARCHAR(255),
  bio TEXT,
  travel_style VARCHAR(100) DEFAULT 'Explorer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Cities Table
CREATE TABLE IF NOT EXISTS cities (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Activities Table
CREATE TABLE IF NOT EXISTS activities (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Trips Table
CREATE TABLE IF NOT EXISTS trips (
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Trip Stops Table
CREATE TABLE IF NOT EXISTS trip_stops (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Stop Activities Table
CREATE TABLE IF NOT EXISTS stop_activities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  stop_id INT NOT NULL,
  activity_id INT NOT NULL,
  scheduled_day INT DEFAULT 1,
  scheduled_time VARCHAR(20) DEFAULT '10:00 AM',
  cost DECIMAL(10, 2) DEFAULT 0.00,
  notes TEXT,
  FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. User Favorites Table
CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  city_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
  UNIQUE KEY user_city_fav (user_id, city_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
