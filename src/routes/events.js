const express = require("express");
const { query } = require("../config/db");
const { authenticate, optionalAuth } = require("../middleware/auth");

const router = express.Router();

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming",
];

function formatEvent(row, includeContact) {
  const event = {
    id: row.id,
    title: row.title,
    description: row.description,
    state: row.state,
    city: row.city,
    venue: row.venue,
    event_date: row.event_date,
    start_time: row.start_time,
    end_time: row.end_time,
    status: row.status,
    created_at: row.created_at,
  };

  if (includeContact) {
    event.contact_email = row.contact_email;
    event.contact_phone = row.contact_phone;
  }

  return event;
}

router.get("/states", (_req, res) => {
  res.json({ states: US_STATES });
});

router.get("/", optionalAuth, (req, res) => {
  const { state } = req.query;
  const isAuthed = Boolean(req.user);
  const params = [];
  let sql = "SELECT * FROM events WHERE status = 'approved'";

  if (state) {
    sql += " AND state = ?";
    params.push(state);
  }

  sql += " ORDER BY event_date ASC, start_time ASC";

  const rows = query.all(sql, params);
  const events = rows.map((row) => formatEvent(row, isAuthed));

  const grouped = {};
  for (const event of events) {
    if (!grouped[event.event_date]) grouped[event.event_date] = [];
    grouped[event.event_date].push(event);
  }

  res.json({ events, grouped, state: state || null });
});

router.get("/:id", optionalAuth, (req, res) => {
  const row = query.get("SELECT * FROM events WHERE id = ?", [req.params.id]);
  if (!row) return res.status(404).json({ error: "Event not found" });

  if (row.status !== "approved" && (!req.user || (req.user.id !== row.organizer_id && req.user.role !== "admin"))) {
    return res.status(404).json({ error: "Event not found" });
  }

  res.json({ event: formatEvent(row, Boolean(req.user)) });
});

router.post("/", authenticate, (req, res) => {
  const {
    title, description, state, city, venue,
    event_date, start_time, end_time,
    contact_email, contact_phone,
  } = req.body;

  if (!title || !description || !state || !city || !event_date) {
    return res.status(400).json({ error: "Title, description, state, city, and event date are required" });
  }

  if (!US_STATES.includes(state)) {
    return res.status(400).json({ error: "Invalid US state" });
  }

  const result = query.run(
    `INSERT INTO events (
      title, description, state, city, venue, event_date,
      start_time, end_time, organizer_id, contact_email, contact_phone, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [
      title, description, state, city, venue || null, event_date,
      start_time || null, end_time || null, req.user.id,
      contact_email || req.user.email, contact_phone || req.user.phone,
    ]
  );

  const event = query.get("SELECT * FROM events WHERE id = ?", [result.lastInsertRowid]);
  res.status(201).json({
    message: "Event submitted for admin approval",
    event: formatEvent(event, true),
  });
});

router.get("/my/listings", authenticate, (req, res) => {
  const rows = query.all(
    "SELECT * FROM events WHERE organizer_id = ? ORDER BY created_at DESC",
    [req.user.id]
  );
  res.json({ events: rows.map((row) => formatEvent(row, true)) });
});

module.exports = router;
