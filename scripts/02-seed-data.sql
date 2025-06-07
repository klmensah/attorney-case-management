-- Insert admin user (password: admin123)
INSERT INTO users (email, name, role, status, password_hash) VALUES 
('admin@lawfirm.com', 'System Administrator', 'admin', 'approved', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ');

-- Insert sample attorneys
INSERT INTO users (email, name, role, status, password_hash) VALUES 
('john.doe@lawfirm.com', 'John Doe', 'attorney', 'approved', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ'),
('jane.smith@lawfirm.com', 'Jane Smith', 'attorney', 'approved', '$2a$10$rOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQZQZQZQZOzJqQZQZQZQZQ');

-- Insert sample cases
INSERT INTO cases (date_assigned, suit_number, file_number, subject, assigning_officer, assigned_to) VALUES 
('2024-01-15', 'SUIT-2024-001', 'FILE-001', 'Contract Dispute - ABC Corp vs XYZ Ltd', 'Chief Justice Office', 1),
('2024-01-20', 'SUIT-2024-002', 'FILE-002', 'Personal Injury Claim - Motor Vehicle Accident', 'District Court', 2);

-- Insert sample movement logs
INSERT INTO movement_logs (case_id, location, action_taken, moved_by, notes) VALUES 
(1, 'Court Registry', 'Case filed and registered', 1, 'Initial filing completed'),
(1, 'Judge Chambers', 'Preliminary hearing scheduled', 1, 'Hearing set for next month'),
(2, 'Court Registry', 'Case filed and registered', 2, 'All documents submitted');

-- Insert sample reminders
INSERT INTO reminders (case_id, user_id, title, description, reminder_date) VALUES 
(1, 1, 'Preliminary Hearing', 'Prepare for preliminary hearing in ABC Corp case', '2024-02-15 09:00:00'),
(2, 2, 'Document Review', 'Review medical reports for personal injury case', '2024-02-10 14:00:00');
