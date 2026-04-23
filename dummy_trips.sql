CREATE TABLE IF NOT EXISTS trips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start_place VARCHAR(255) NOT NULL,
  end_place VARCHAR(255) NOT NULL,
  date DATE,
  distance_km DECIMAL(10, 2),
  transport VARCHAR(50) DEFAULT 'car',
  is_imported_from_google BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data (optional, but ensures we insert fresh dummy data)
TRUNCATE TABLE trips;

INSERT INTO trips (title, start_place, end_place, date, distance_km, transport, is_imported_from_google) VALUES
('Weekend Getaway', 'Mumbai', 'Lonavala', '2023-11-10', 83.5, 'car', FALSE),
('Business Trip', 'Delhi', 'Bengaluru', '2023-12-05', 1740.0, 'flight', TRUE),
('Backpacking North', 'Manali', 'Leh', '2022-07-15', 427.0, 'bike', FALSE),
('Heritage Tour', 'Jaipur', 'Agra', '2023-01-20', 240.0, 'bus', FALSE),
('Coastal Drive', 'Mangaluru', 'Gokarna', '2023-03-12', 230.5, 'car', TRUE),
('Train Journey to East', 'Kolkata', 'Darjeeling', '2023-10-02', 615.0, 'train', FALSE),
('Quick City Visit', 'Pune', 'Mumbai', '2024-02-14', 150.0, 'cab', FALSE),
('Trekking Expedition', 'Dehradun', 'Kedarnath', '2024-05-10', 250.0, 'walk', TRUE),
('Southern Exploration', 'Chennai', 'Pondicherry', '2024-01-26', 151.0, 'bike', FALSE),
('Festival Trip', 'Ahmedabad', 'Kutch', '2023-12-25', 400.0, 'car', TRUE);
