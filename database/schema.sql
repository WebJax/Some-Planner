-- SoMe Planner Database Schema
-- Create tables

-- Shops table
CREATE TABLE IF NOT EXISTS shops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    type ENUM('post', 'reel') NOT NULL DEFAULT 'post',
    format VARCHAR(100) COMMENT 'butik i fokus, engagement, etc.',
    shop_id INT DEFAULT NULL,
    status ENUM('draft', 'ready', 'published') NOT NULL DEFAULT 'draft',
    caption TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL,
    INDEX idx_date (date),
    INDEX idx_status (status),
    INDEX idx_shop_id (shop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Media table
CREATE TABLE IF NOT EXISTS media (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    media_type ENUM('image', 'video') NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    caption_template TEXT,
    media_guide TEXT COMMENT 'Guidelines for media content',
    active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
INSERT INTO shops (name, contact_name, active) VALUES
    ('Bageren', 'Morten Hansen', 1),
    ('Blomster & Co', 'Line Nielsen', 1),
    ('Mode & Stil', 'Camilla Berg', 1);

INSERT INTO templates (name, caption_template, media_guide) VALUES
    ('Butik i fokus', '🏪 {shop_name}\n\n{beskrivelse}\n\n📍 Find os i butikscenter\n\n#lokalebutikker #shopping', 'Billede af butiksfacade eller produkter'),
    ('Tilbud/kampagne', '🎉 {tilbud_tekst}\n\n⏰ Gælder til {dato}\n\n{shop_name}\n\n#tilbud #shopping', 'Grafik med tilbudspriser'),
    ('Åbningstider', '⏰ Husk åbningstider:\n{åbningstider}\n\n{shop_name}\n\n#åbningstider', 'Simpel grafik med åbningstider');

-- Create uploads directory (done via PHP/filesystem)
