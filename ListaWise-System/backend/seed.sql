-- ListaWise Initial Demo Seed Data for PostgreSQL

-- Clean existing data
DELETE FROM transactions;
DELETE FROM customers;
DELETE FROM users;

-- Seed default store users
-- Default passwords:
-- owner -> owner123
-- staff -> staff123
INSERT INTO users (username, password_hash, role, name) VALUES
('owner', '$2a$10$acouJv4eqVTelzmrfJ9u5Ojd2k1W79lWe0b7Qb9bNmllG6SsStujC', 'owner', 'Tindahan ni Aling Rosa (Owner)'),
('staff', '$2a$10$acouJv4eqVTelzmrfJ9u5Ojd2k1W79lWe0b7Qb9bNmllG6SsStujC', 'staff', 'Store Cashier Staff');

-- Seed initial customers
INSERT INTO customers (id, name, phone, address, credit_limit, days_outstanding) VALUES
(1, 'Lita Cruz', '0917-111-2233', 'Block 4 Lot 12, Barangay San Roque, Pasay City', 1500, 92),
(2, 'Maria Santos', '0917-222-3344', '15 Rosal St, Cubao, Quezon City', 1000, 61),
(3, 'Ana Flores', '0917-333-4455', 'Sitio Kawayan, Cebu City', 800, 18),
(4, 'Rico Dela Cruz', '0917-444-5566', 'Km 7 Bangkal, Davao City', 1200, 12),
(5, 'Jose Reyes', '0918-555-6677', 'Purok 3, Tagum City', 1000, 45),
(6, 'Danny Villanueva', '0919-666-7788', 'Zone 2, Barangay Carmen, CDO', 600, 10),
(7, 'Elena Bautista', '0920-777-8899', '77 Acacia Lane, Marikina City', 2000, 0);

-- Reset customer serial sequence
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));

-- Seed sample transactions
INSERT INTO transactions (customer_id, transaction_type, amount, payment_method, notes) VALUES
(1, 'credit', 520.00, NULL, '2 sacks of Rice (25kg) & Cooking oil'),
(1, 'credit', 300.00, NULL, 'Canned goods and grocery items'),
(1, 'payment', 150.00, 'Cash', 'Partial payment on rice'),
(2, 'credit', 350.00, NULL, 'Pork & Chicken meat advance'),
(2, 'credit', 250.00, NULL, 'Laundry detergent & toiletries'),
(2, 'payment', 115.00, 'GCash', 'GCash Ref #4928192831'),
(3, 'credit', 430.00, NULL, 'Snacks, coffee and canned milk'),
(3, 'payment', 90.00, 'Cash', 'Cash payment from salary'),
(4, 'credit', 260.00, NULL, 'Softdrinks case & crackers'),
(4, 'payment', 50.00, 'Cash', 'Partial cash payment');
