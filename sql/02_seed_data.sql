-- ============================================================================
-- E-Commerce Order, Inventory and Sales Analytics System
-- Script: 02_seed_data.sql
-- Description: Inserts standard sample dataset matching experimental benchmark.
-- DBMS: PostgreSQL 18
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Populate Customers (5 records)
-- ----------------------------------------------------------------------------
INSERT INTO customers (customer_id, customer_name, email, phone, city) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@example.com', '9876543210', 'Delhi'),
(2, 'Priya Verma',  'priya.verma@example.com',  '9876543211', 'Mumbai'),
(3, 'Rahul Mehta',  'rahul.mehta@example.com',  '9876543212', 'Bangalore'),
(4, 'Ananya Singh', 'ananya.singh@example.com', '9876543213', 'Kolkata'),
(5, 'Kabir Gupta',  'kabir.gupta@example.com',  '9876543214', 'Hyderabad');

SELECT setval('customers_customer_id_seq', (SELECT MAX(customer_id) FROM customers));

-- ----------------------------------------------------------------------------
-- 2. Populate Products (6 records)
-- ----------------------------------------------------------------------------
INSERT INTO products (product_id, product_name, category, price) VALUES
(1, 'Laptop',              'Electronics', 55000.00),
(2, 'Wireless Mouse',       'Accessories',   800.00),
(3, 'Mechanical Keyboard',  'Accessories',  3000.00),
(4, 'Monitor',              'Electronics', 15000.00),
(5, 'Headphones',           'Accessories',  2000.00),
(6, 'Web Camera',           'Electronics',  4000.00);

SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));

-- ----------------------------------------------------------------------------
-- 3. Populate Inventory (6 records)
-- ----------------------------------------------------------------------------
INSERT INTO inventory (inventory_id, product_id, stock_quantity, last_updated) VALUES
(1, 1, 15, '2026-10-01 10:00:00'),
(2, 2, 50, '2026-10-01 10:00:00'),
(3, 3, 25, '2026-10-01 10:00:00'),
(4, 4,  4, '2026-10-01 10:00:00'),
(5, 5,  3, '2026-10-01 10:00:00'),
(6, 6, 20, '2026-10-01 10:00:00');

SELECT setval('inventory_inventory_id_seq', (SELECT MAX(inventory_id) FROM inventory));

-- ----------------------------------------------------------------------------
-- 4. Populate Orders (6 records)
-- ----------------------------------------------------------------------------
INSERT INTO orders (order_id, customer_id, order_date, status) VALUES
(1, 1, '2026-10-05', 'DELIVERED'),
(2, 2, '2026-10-08', 'DELIVERED'),
(3, 3, '2026-10-12', 'PENDING'),
(4, 1, '2026-10-15', 'SHIPPED'),
(5, 4, '2026-10-20', 'PAID'),
(6, 5, '2026-10-25', 'DELIVERED');

SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));

-- ----------------------------------------------------------------------------
-- 5. Populate Order Items (10 records across 6 orders)
-- ----------------------------------------------------------------------------
INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES
(1,  1, 1, 1, 55000.00),  -- Order 1: Laptop (55000.00)
(2,  1, 2, 2,   800.00),  -- Order 1: 2x Mouse (1600.00) -> Order 1 Total = 56600.00
(3,  2, 5, 2,  2000.00),  -- Order 2: 2x Headphones (4000.00) -> Order 2 Total = 4000.00
(4,  3, 6, 3,  4000.00),  -- Order 3: 3x Web Camera (12000.00) -> Order 3 Total = 12000.00
(5,  4, 4, 2, 15000.00),  -- Order 4: 2x Monitor (30000.00)
(6,  4, 2, 1,   800.00),  -- Order 4: 1x Mouse (800.00) -> Order 4 Total = 30800.00
(7,  5, 3, 1,  3000.00),  -- Order 5: 1x Keyboard (3000.00)
(8,  5, 5, 1,  2000.00),  -- Order 5: 1x Headphones (2000.00) -> Order 5 Total = 5000.00
(9,  6, 3, 1,  3000.00),  -- Order 6: 1x Keyboard (3000.00)
(10, 6, 2, 1,   800.00);  -- Order 6: 1x Mouse (800.00) -> Order 6 Total = 3800.00

SELECT setval('order_items_order_item_id_seq', (SELECT MAX(order_item_id) FROM order_items));

-- ----------------------------------------------------------------------------
-- 6. Populate Payments (6 records)
-- ----------------------------------------------------------------------------
INSERT INTO payments (payment_id, order_id, amount, payment_method, payment_status, payment_date) VALUES
(1, 1, 56600.00, 'UPI',         'SUCCESS', '2026-10-05 14:30:00'),
(2, 2,  4000.00, 'CREDIT_CARD', 'SUCCESS', '2026-10-08 11:15:00'),
(3, 3, 12000.00, 'NET_BANKING', 'FAILED',  '2026-10-12 16:45:00'),
(4, 4, 30800.00, 'CREDIT_CARD', 'SUCCESS', '2026-10-15 10:20:00'),
(5, 5,  5000.00, 'DEBIT_CARD',  'SUCCESS', '2026-10-20 18:00:00'),
(6, 6,  3800.00, 'UPI',         'SUCCESS', '2026-10-25 09:30:00');

SELECT setval('payments_payment_id_seq', (SELECT MAX(payment_id) FROM payments));
