-- Database schema for Birthday Invitation

CREATE DATABASE IF NOT EXISTS birthday_invitation;

USE birthday_invitation;

-- Guests table to store guest information
CREATE TABLE IF NOT EXISTS guests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    invitation_code VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para almacenar las puntuaciones del minijuego
CREATE TABLE IF NOT EXISTS game_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

-- RSVP table to store responses
CREATE TABLE IF NOT EXISTS rsvp (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'declined', 'unsure') DEFAULT 'pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE CASCADE
);

-- Visitor logs table to track interactions
CREATE TABLE IF NOT EXISTS visitor_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    guest_id INT,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    visit_count INT DEFAULT 1,
    last_page VARCHAR(255),
    country VARCHAR(50),
    city VARCHAR(100),
    device_type VARCHAR(50),
    FOREIGN KEY (guest_id) REFERENCES guests(id) ON DELETE SET NULL
);

INSERT INTO guests (name, email, invitation_code) VALUES
('Carlos', 'carlos@example.com', 'carlos'),
('Maria', 'maria@example.com', 'maria'),
('Juan', 'juan@example.com', 'juan');

INSERT INTO rsvp (guest_id, status) VALUES
(1, 'pending'),
(2, 'pending'),
(3, 'pending');

