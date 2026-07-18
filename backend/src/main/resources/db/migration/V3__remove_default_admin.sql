-- Remove the legacy default admin account seeded in V2. Production admins are created via
-- ADMIN_EMAIL / ADMIN_PASSWORD environment variables at application startup.
DELETE FROM users
WHERE email = 'admin@habeshaevents.com'
  AND role = 'admin';
