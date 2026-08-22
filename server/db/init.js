const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function initDB() {
  console.log('🚀 Connecting to MySQL server...');
  let connection;
  try {
    try {
      connection = await mysql.createConnection(DB_CONFIG);
    } catch (cErr) {
      console.log('⚠️ Connection refused. Auto-starting mysqld daemon...');
      const { exec } = require('child_process');
      await new Promise(r => exec(`powershell -Command "Start-Process -FilePath 'C:\\xampp\\mysql\\bin\\mysqld.exe' -ArgumentList '--defaults-file=C:\\xampp\\mysql\\bin\\my.ini' -WindowStyle Hidden"`, () => setTimeout(r, 2000)));
      connection = await mysql.createConnection(DB_CONFIG);
    }
    console.log('✅ Connected to MySQL.');

    // Execute schema creation
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Database & Tables initialized successfully.');

    await connection.changeUser({ database: 'globetrotter' });

    // Seed Data
    console.log('🌱 Seeding initial database data...');

    // 1. Seed Users
    const hashedPassAdmin = await bcrypt.hash('Kano@5107', 10);
    const hashedPassUser = await bcrypt.hash('password123', 10);
    const usersData = [
      ['Admin Manager', 'hbhalani937@gmail.com', hashedPassAdmin, 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80', 'Platform Administrator & Frequent Flyer', 'Luxury Traveler'],
      ['Alex Rivers', 'alex@globetrotter.com', hashedPassUser, 'user', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', 'Digital nomad exploring European gems and Asian street food.', 'Backpacker'],
      ['Sophia Chen', 'sophia@globetrotter.com', hashedPassUser, 'user', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 'Architect, photographer, and culture enthusiast.', 'Culture & Photography']
    ];

    for (const u of usersData) {
      await connection.query(
        `INSERT INTO users (name, email, password, role, avatar, bio, travel_style) 
         VALUES (?, ?, ?, ?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE name=VALUES(name), avatar=VALUES(avatar), bio=VALUES(bio)`,
        u
      );
    }

    // 2. Seed Cities
    const citiesData = [
      ['Paris', 'France', 'Europe', '$$$', 180.00, 4.9, 90, 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', 'The City of Light, famous for fashion, art, gastronomy, and iconic landmarks like the Eiffel Tower.', 48.8566, 2.3522],
      ['Tokyo', 'Japan', 'Asia', '$$$', 160.00, 4.95, 98, 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', 'A dazzling metropolis blending futuristic skyscrapers with ancient temples and world-class culinary scenes.', 35.6762, 139.6503],
      ['Rome', 'Italy', 'Europe', '$$', 140.00, 4.85, 88, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', 'An open-air museum boasting millenniums of history, ruins, Vatican treasures, and authentic trattorias.', 41.9028, 12.4964],
      ['Barcelona', 'Spain', 'Europe', '$$', 130.00, 4.80, 86, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=800&q=80', 'Vibrant coastal city famed for Gaudi architecture, sunny beach promenades, and bustling tapas bars.', 41.3851, 2.1734],
      ['New York', 'USA', 'North America', '$$$$', 220.00, 4.88, 85, 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80', 'The city that never sleeps, offering Broadway shows, Central Park escapes, and soaring skyline views.', 40.7128, -74.0060],
      ['Bali', 'Indonesia', 'Asia', '$', 65.00, 4.92, 92, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', 'Tropical paradise known for lush rice terraces, sacred temples, surf beaches, and tranquil wellness retreats.', -8.4095, 115.1889],
      ['Sydney', 'Australia', 'Oceania', '$$$', 175.00, 4.87, 94, 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80', 'Harbor icon featuring the Opera House, Bondi Beach coastal walks, and vibrant sunny outdoor lifestyle.', -33.8688, 151.2093],
      ['Dubai', 'UAE', 'Middle East', '$$$$', 210.00, 4.82, 96, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80', 'Ultra-modern oasis renowned for luxury shopping, futuristic architecture, and desert safari adventures.', 25.2048, 55.2708],
      ['Bangkok', 'Thailand', 'Asia', '$', 55.00, 4.78, 87, 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80', 'Energetic street life, ornate temples, bustling floating markets, and famous spicy Thai cuisine.', 13.7563, 100.5018],
      ['Reykjavik', 'Iceland', 'Europe', '$$$$', 200.00, 4.91, 99, 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', 'Gateway to geothermal lagoons, Northern Lights wonders, cascading waterfalls, and volcanic landscapes.', 64.1466, -21.9426],
      ['Rio de Janeiro', 'Brazil', 'South America', '$$', 95.00, 4.75, 78, 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80', 'Dramatic coastal peaks, iconic Copacabana sands, Christ the Redeemer statue, and samba rhythms.', -22.9068, -43.1729],
      ['Cairo', 'Egypt', 'Africa', '$', 60.00, 4.70, 80, 'https://images.unsplash.com/photo-1572252821143-035a744e82b7?auto=format&fit=crop&w=800&q=80', 'Ancient wonder city featuring the Giza Pyramids, Sphinx, Grand Egyptian Museum, and Nile river cruises.', 30.0444, 31.2357]
    ];

    for (const c of citiesData) {
      await connection.query(
        `INSERT INTO cities (name, country, region, cost_index, avg_cost_per_day, popularity_rating, safety_index, image_url, description, latitude, longitude)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE avg_cost_per_day=VALUES(avg_cost_per_day), image_url=VALUES(image_url), description=VALUES(description)`,
        c
      );
    }

    // 3. Seed Activities
    const [cityRows] = await connection.query('SELECT id, name FROM cities');
    const cityMap = {};
    cityRows.forEach(row => { cityMap[row.name] = row.id; });

    const activitiesData = [
      // Paris
      [cityMap['Paris'], 'Eiffel Tower Summit Access & Champagne', 'Sightseeing', 45.00, 2.5, 4.9, 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?auto=format&fit=crop&w=600&q=80', 'Panoramic views of Paris from the 3rd floor summit with a celebratory glass of champagne.'],
      [cityMap['Paris'], 'Louvre Museum Timed Entry & Masterpieces Tour', 'Culture', 35.00, 3.5, 4.95, 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=600&q=80', 'Skip-the-line entrance to admire the Mona Lisa, Venus de Milo, and thousands of royal treasures.'],
      [cityMap['Paris'], 'Seine River Sunset Gourmet Cruise', 'Food & Dining', 75.00, 2.0, 4.85, 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=600&q=80', 'A 3-course French dining experience gliding past illuminated monuments.'],
      [cityMap['Paris'], 'Montmartre Bakery & Pastry Food Walk', 'Food & Dining', 50.00, 2.5, 4.8, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', 'Sample warm baguettes, artisanal croissants, macaroons, and cheeses with a local culinary guide.'],

      // Tokyo
      [cityMap['Tokyo'], 'Sensō-ji Temple & Asakusa Traditional Walk', 'Culture', 15.00, 2.0, 4.9, 'https://images.unsplash.com/photo-1583838573212-b7e5272a2e4e?auto=format&fit=crop&w=600&q=80', 'Explore Tokyo’s oldest Buddhist temple and shop along Nakamise-dori shopping street.'],
      [cityMap['Tokyo'], 'Shibuya Crossing & Robot Restaurant Experience', 'Nightlife', 65.00, 3.0, 4.75, 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=600&q=80', 'Experience the world’s busiest pedestrian crossing and neon night energy.'],
      [cityMap['Tokyo'], 'Tsukiji Outer Market Sushi Masterclass', 'Food & Dining', 90.00, 3.0, 4.95, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80', 'Hand-select fresh seafood and learn to craft authentic nigiri sushi from a veteran chef.'],
      [cityMap['Tokyo'], 'Mount Fuji & Hakone Day Trip with Bullet Train', 'Adventure', 120.00, 8.0, 4.92, 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=600&q=80', 'Gaze upon Japan’s sacred volcano, cruise Lake Ashi, and ride the Shinkansen back to Tokyo.'],

      // Rome
      [cityMap['Rome'], 'Colosseum & Roman Forum VIP Tour', 'Culture', 55.00, 3.0, 4.93, 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80', 'Walk on the gladiator arena floor and explore the ruins of ancient Rome.'],
      [cityMap['Rome'], 'Vatican Museums & Sistine Chapel Early Access', 'Culture', 60.00, 3.5, 4.96, 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?auto=format&fit=crop&w=600&q=80', 'Marvel at Michelangelo’s ceiling frescoes before public opening hours.'],
      [cityMap['Rome'], 'Trastevere Evening Wine & Pasta Tasting', 'Food & Dining', 70.00, 3.0, 4.88, 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=600&q=80', 'Stroll cobblestone alleys sampling cacio e pepe, supplì, gelato, and regional Italian wines.'],

      // Barcelona
      [cityMap['Barcelona'], 'Sagrada Família Fast-Track Tower Tour', 'Sightseeing', 40.00, 2.0, 4.94, 'https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=600&q=80', 'Admire Antoni Gaudí’s masterpiece basilica and ascend the nativity tower for coast views.'],
      [cityMap['Barcelona'], 'Park Güell & Gothic Quarter Walking Tour', 'Culture', 30.00, 2.5, 4.85, 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=600&q=80', 'Discover colorful mosaic dragon statues and medieval alleyways.'],
      [cityMap['Barcelona'], 'Flamenco Show with Tapas & Sangria', 'Nightlife', 55.00, 2.5, 4.82, 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80', 'Passionate Spanish dance and guitar performance with authentic small plates.'],

      // Bali
      [cityMap['Bali'], 'Tegallalang Rice Terraces & Jungle Swing', 'Adventure', 25.00, 3.0, 4.88, 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80', 'Iconic green valley views, coffee plantation tastings, and high-flying photo swings.'],
      [cityMap['Bali'], 'Uluwatu Temple Sunset & Kecak Fire Dance', 'Culture', 30.00, 3.0, 4.91, 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=600&q=80', 'Clifftop ocean sunset accompanied by traditional chant dancing.'],
      [cityMap['Bali'], 'Seminyak Luxury Beach Club Spa Day', 'Relaxation', 80.00, 4.0, 4.90, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 'Full body Balinese flower massage followed by sunset cocktails by the infinity pool.']
    ];

    for (const act of activitiesData) {
      if (act[0]) {
        await connection.query(
          `INSERT INTO activities (city_id, title, category, cost, duration_hours, rating, image_url, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          act
        );
      }
    }

    // 4. Seed Preset Trips
    const [userRows] = await connection.query('SELECT id, email FROM users');
    const alexUser = userRows.find(u => u.email === 'alex@globetrotter.com') || userRows[0];

    const [tripCheck] = await connection.query('SELECT COUNT(*) as count FROM trips');
    if (tripCheck[0].count === 0) {
      // Create Euro Grand Tour
      const [tripResult] = await connection.query(
        `INSERT INTO trips (user_id, title, description, start_date, end_date, target_budget, cover_image, visibility, share_slug, status)
         VALUES (?, ?, ?, '2026-09-10', '2026-09-22', 2400.00, ?, 'public', 'euro-grand-tour-2026', 'upcoming')`,
        [alexUser.id, 'Grand European Gateway: Paris, Rome & Barcelona', 'A 12-day journey across Western Europe experiencing architectural marvels, historic ruins, and Michelin culinary hotspots.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80']
      );

      const tripId = tripResult.insertId;

      // Add stops for Paris, Rome, Barcelona
      const stops = [
        [tripId, cityMap['Paris'], 1, '2026-09-10', '2026-09-14', 600.00, 150.00, 'Stay near Le Marais district'],
        [tripId, cityMap['Rome'], 2, '2026-09-14', '2026-09-18', 480.00, 120.00, 'Flight from Paris Orly to Rome Fiumicino'],
        [tripId, cityMap['Barcelona'], 3, '2026-09-18', '2026-09-22', 450.00, 90.00, 'Hotel in Gothic Quarter']
      ];

      for (const s of stops) {
        const [stopRes] = await connection.query(
          `INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date, stay_cost, transport_cost, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          s
        );
        const stopId = stopRes.insertId;

        // Attach activities for this stop
        const [acts] = await connection.query('SELECT id, cost FROM activities WHERE city_id = ? LIMIT 2', [s[1]]);
        for (let idx = 0; idx < acts.length; idx++) {
          await connection.query(
            `INSERT INTO stop_activities (stop_id, activity_id, scheduled_day, scheduled_time, cost)
             VALUES (?, ?, ?, ?, ?)`,
            [stopId, acts[idx].id, idx + 1, idx === 0 ? '10:00 AM' : '04:00 PM', acts[idx].cost]
          );
        }
      }

      // Create Asia Escape Trip
      const [trip2] = await connection.query(
        `INSERT INTO trips (user_id, title, description, start_date, end_date, target_budget, cover_image, visibility, share_slug, status)
         VALUES (?, ?, ?, '2026-11-01', '2026-11-12', 1800.00, ?, 'public', 'tokyo-bali-wonderland', 'upcoming')`,
        [alexUser.id, 'Tokyo Cyberpunk & Bali Tropical Retreat', 'Contrast high-tech urban energy in Tokyo with serene tropical beaches and rice terrace retreats in Bali.', 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80']
      );

      const tripId2 = trip2.insertId;
      const stops2 = [
        [tripId2, cityMap['Tokyo'], 1, '2026-11-01', '2026-11-06', 700.00, 400.00, 'Shinjuku boutique hotel'],
        [tripId2, cityMap['Bali'], 2, '2026-11-06', '2026-11-12', 350.00, 250.00, 'Ubud jungle villa']
      ];

      for (const s of stops2) {
        await connection.query(
          `INSERT INTO trip_stops (trip_id, city_id, stop_order, arrival_date, departure_date, stay_cost, transport_cost, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          s
        );
      }
    }

    console.log('✅ Seed data insertion complete!');
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initDB();
}

module.exports = initDB;
