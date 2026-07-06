const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../../data/events.db");
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      state TEXT NOT NULL,
      city TEXT NOT NULL,
      venue TEXT,
      event_date TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      organizer_id INTEGER NOT NULL,
      contact_email TEXT,
      contact_phone TEXT,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (organizer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ad_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      tier TEXT NOT NULL,
      message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_events_state ON events(state);
    CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  `);
}

function seedAdmin() {
  const bcrypt = require("bcryptjs");
  const existing = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (existing) return;

  const passwordHash = bcrypt.hashSync("admin123", 10);
  db.prepare(
    `INSERT INTO users (email, phone, password_hash, role)
     VALUES (?, ?, ?, 'admin')`
  ).run("admin@habeshaevents.com", null, passwordHash);
}

function seedSampleEvents() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM events").get().c;
  if (count > 0) return;

  const admin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!admin) return;

  const today = new Date();
  const fmt = (d) => d.toISOString().split("T")[0];
  const day1 = fmt(today);
  const day2 = fmt(new Date(today.getTime() + 86400000));
  const day3 = fmt(new Date(today.getTime() + 172800000));

  const samples = [
    { title: "Habesha New Year Celebration", city: "Arlington", state: "Virginia", venue: "Community Center Hall", date: day1, start: "18:00", desc: "Join us for traditional food, music, and dance celebrating Enkutatash." },
    { title: "Ethiopian Coffee Ceremony & Networking", city: "Silver Spring", state: "Maryland", venue: "Habesha Cafe", date: day1, start: "14:00", desc: "An afternoon of bunna, conversation, and community connections." },
    { title: "Tigrinya Poetry Night", city: "Dallas", state: "Texas", venue: "Cultural Arts Center", date: day2, start: "19:30", desc: "Local poets share original works in Tigrinya and Amharic." },
    { title: "Eritrean Independence Day Gala", city: "Alexandria", state: "Virginia", venue: "Grand Ballroom", date: day2, start: "17:00", desc: "Annual gala with live bands, cultural performances, and dinner." },
    { title: "Habesha Sports Tournament", city: "Atlanta", state: "Georgia", venue: "Piedmont Park", date: day3, start: "09:00", desc: "Soccer and volleyball tournament open to all ages." },
    { title: "Amharic Language Workshop", city: "Los Angeles", state: "California", venue: "LA Community Library", date: day3, start: "11:00", desc: "Beginner-friendly Amharic language class for kids and adults." },
  ];

  const insert = db.prepare(
    `INSERT INTO events (title, description, state, city, venue, event_date, start_time, organizer_id, contact_email, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`
  );

  for (const s of samples) {
    insert.run(s.title, s.desc, s.state, s.city, s.venue, s.date, s.start, admin.id, "events@habeshaevents.com");
  }
}

initSchema();
seedAdmin();
seedSampleEvents();

module.exports = {
  db,
  query: {
    get: (sql, params = []) => db.prepare(sql).get(...params),
    all: (sql, params = []) => db.prepare(sql).all(...params),
    run: (sql, params = []) => db.prepare(sql).run(...params),
  },
};
