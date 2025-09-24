-- Insert predefined themes for the app
-- This will skip duplicates if themes already exist

INSERT OR IGNORE INTO themes (name, gradient_class) VALUES 
('Sunset Bliss', 'bg-gradient-to-br from-rose-200 via-fuchsia-200 to-sky-200'),
('Ocean Wave', 'bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200'),
('Forest Hike', 'bg-gradient-to-br from-green-200 via-lime-200 to-yellow-200'),
('Lavender Dream', 'bg-gradient-to-br from-purple-200 via-pink-200 to-red-200'),
('Autumn Glow', 'bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200'),
('Cool Breeze', 'bg-gradient-to-br from-teal-200 via-cyan-200 to-blue-200');