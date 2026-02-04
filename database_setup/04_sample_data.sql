-- Default admin user
INSERT INTO users (email, password_hash, role, full_name, phone) 
VALUES ('admin@college.edu', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5TQhUqRQvp7M.', 'admin', 'System Administrator', '1234567890');

-- Sample shortage threshold
INSERT INTO shortage_threshold (department, minimum_percentage, warning_percentage, is_active)
VALUES ('Computer Science', 75.00, 80.00, TRUE);
