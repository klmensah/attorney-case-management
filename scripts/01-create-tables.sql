-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('admin', 'attorney', 'staff') DEFAULT 'attorney',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  password_hash VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date_assigned DATE NOT NULL,
  suit_number VARCHAR(100) UNIQUE NOT NULL,
  file_number VARCHAR(100) NOT NULL,
  subject TEXT NOT NULL,
  assigning_officer VARCHAR(255) NOT NULL,
  assigned_to INT,
  status ENUM('active', 'pending', 'completed', 'archived') DEFAULT 'active',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Create movement_logs table
CREATE TABLE IF NOT EXISTS movement_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  location VARCHAR(255),
  action_taken TEXT NOT NULL,
  moved_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (moved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create case_comments table
CREATE TABLE IF NOT EXISTS case_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  user_id INT NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reminder_date DATETIME NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  message TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  processed_by INT,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
);
