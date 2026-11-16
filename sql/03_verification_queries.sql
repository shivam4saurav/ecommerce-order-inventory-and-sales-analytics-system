-- ============================================================================
-- E-Commerce Order, Inventory and Sales Analytics System
-- Script: 03_verification_queries.sql
-- Description: Table record counts and verification queries (Module 1).
-- DBMS: PostgreSQL 18
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Verification Query 1: Single-row System Verification Summary (Figure 5)
-- Returns exact column names and counts as captured in pgAdmin output.
-- ----------------------------------------------------------------------------
SELECT 
    (SELECT COUNT(*) FROM customers) AS total_customers,
    (SELECT COUNT(*) FROM products) AS total_products,
    (SELECT COUNT(*) FROM inventory) AS inventory_records,
    (SELECT COUNT(*) FROM orders) AS total_orders,
    (SELECT COUNT(*) FROM order_items) AS order_item_records,
    (SELECT COUNT(*) FROM payments) AS payment_records,
    (SELECT SUM(amount) FROM payments WHERE payment_status = 'SUCCESS') AS successful_payment_revenue,
    (SELECT COUNT(*) FROM inventory WHERE stock_quantity < 5) AS low_stock_products;

-- ----------------------------------------------------------------------------
-- Verification Query 2: Appendix B.1 Union-All Table Row Count
-- ----------------------------------------------------------------------------
SELECT 'customers' AS table_name, COUNT(*) AS total_records FROM customers
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'inventory', COUNT(*) FROM inventory
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'payments', COUNT(*) FROM payments;

-- ----------------------------------------------------------------------------
-- Verification Query 3: Appendix B.2 Calculated Order Totals (Figure 10)
-- ----------------------------------------------------------------------------
SELECT 
    order_id, 
    SUM(quantity * unit_price) AS calculated_total
FROM order_items
GROUP BY order_id
ORDER BY order_id;
