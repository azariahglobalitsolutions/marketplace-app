const express = require("express");
const { query } = require("../config/db");

const router = express.Router();

const TIERS = [
  {
    id: "starter",
    name: "Starter Spotlight",
    price: "$49",
    period: "per event",
    features: ["Homepage feature for 3 days", "State filter priority", "Social share badge"],
  },
  {
    id: "growth",
    name: "Growth Boost",
    price: "$129",
    period: "per month",
    features: ["Top of daily calendar", "Featured in newsletter", "Banner on advertise page", "Priority support"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium Partner",
    price: "$299",
    period: "per month",
    features: ["Nationwide homepage hero", "Dedicated account manager", "Custom landing page", "Analytics dashboard"],
  },
];

router.get("/tiers", (_req, res) => {
  res.json({ tiers: TIERS });
});

router.post("/inquiry", (req, res) => {
  const { name, email, phone, tier, message } = req.body;

  if (!name || !email || !tier) {
    return res.status(400).json({ error: "Name, email, and tier are required" });
  }

  const validTier = TIERS.find((t) => t.id === tier);
  if (!validTier) {
    return res.status(400).json({ error: "Invalid pricing tier" });
  }

  const result = query.run(
    "INSERT INTO ad_inquiries (name, email, phone, tier, message) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone || null, tier, message || null]
  );

  res.status(201).json({
    message: "Your advertising inquiry has been received. We will contact you shortly.",
    inquiryId: result.lastInsertRowid,
  });
});

module.exports = router;
