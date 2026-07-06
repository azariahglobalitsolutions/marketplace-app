const express = require("express");
const { query } = require("../config/db");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/pending", (_req, res) => {
  const rows = query.all(
    `SELECT e.*, u.email AS organizer_email, u.phone AS organizer_phone
     FROM events e
     JOIN users u ON u.id = e.organizer_id
     WHERE e.status = 'pending'
     ORDER BY e.created_at ASC`
  );
  res.json({ events: rows });
});

router.post("/:id/approve", (req, res) => {
  const event = query.get("SELECT * FROM events WHERE id = ?", [req.params.id]);
  if (!event) return res.status(404).json({ error: "Event not found" });

  query.run("UPDATE events SET status = 'approved' WHERE id = ?", [req.params.id]);
  const updated = query.get("SELECT * FROM events WHERE id = ?", [req.params.id]);
  res.json({ message: "Event approved", event: updated });
});

router.post("/:id/reject", (req, res) => {
  const event = query.get("SELECT * FROM events WHERE id = ?", [req.params.id]);
  if (!event) return res.status(404).json({ error: "Event not found" });

  query.run("UPDATE events SET status = 'rejected' WHERE id = ?", [req.params.id]);
  const updated = query.get("SELECT * FROM events WHERE id = ?", [req.params.id]);
  res.json({ message: "Event rejected", event: updated });
});

router.get("/ad-inquiries", (_req, res) => {
  const inquiries = query.all("SELECT * FROM ad_inquiries ORDER BY created_at DESC");
  res.json({ inquiries });
});

module.exports = router;
