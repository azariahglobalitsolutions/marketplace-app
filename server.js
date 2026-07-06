require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const { register, metricsMiddleware } = require("./src/middleware/metrics");
const authRoutes = require("./src/routes/auth");
const eventRoutes = require("./src/routes/events");
const adminRoutes = require("./src/routes/admin");
const advertiseRoutes = require("./src/routes/advertise");

require("./src/config/db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({ status: "healthy", service: "habesha-events-usa" });
});

app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/advertise", advertiseRoutes);

app.get("/admin/moderation", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Habesha Events USA running on port ${PORT}`);
});
