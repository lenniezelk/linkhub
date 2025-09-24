-- Insert predefined themes for the app
-- This will skip duplicates if themes already exist

INSERT OR IGNORE INTO themes (id, name, gradient_class, created_at) VALUES 
('th_rose_fuchsia_sky', 'Sunset Bliss', 'bg-gradient-to-br from-rose-200 via-fuchsia-200 to-sky-200', strftime('%s', 'now') * 1000),
('th_blue_cyan_teal', 'Ocean Wave', 'bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-200', strftime('%s', 'now') * 1000),
('th_green_lime_yellow', 'Forest Hike', 'bg-gradient-to-br from-green-200 via-lime-200 to-yellow-200', strftime('%s', 'now') * 1000),
('th_purple_pink_red', 'Lavender Dream', 'bg-gradient-to-br from-purple-200 via-pink-200 to-red-200', strftime('%s', 'now') * 1000),
('th_yellow_orange_red', 'Autumn Glow', 'bg-gradient-to-br from-yellow-200 via-orange-200 to-red-200', strftime('%s', 'now') * 1000),
('th_teal_cyan_blue', 'Cool Breeze', 'bg-gradient-to-br from-teal-200 via-cyan-200 to-blue-200', strftime('%s', 'now') * 1000);