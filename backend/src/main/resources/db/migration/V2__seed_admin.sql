INSERT INTO users (email, phone, phone_country, password_hash, role)
SELECT 'admin@habeshaevents.com', NULL, 'US',
       '$2b$10$YjKQSIAhHS9OoYK5mm6OPup4JGfQrJ084Z/jP8jILip71885jWhYS',
       'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
);
