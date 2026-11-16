-- ============================================================================
-- E-Commerce Order, Inventory and Sales Analytics System
-- Script: 04_analytics_queries.sql
-- Description: Operational summaries and business analytics (Modules 2 & 3).
-- DBMS: PostgreSQL 18
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Module 2, Query 1: Operational Order Summary (Figure 6)
-- Joins orders, customers, order_items, and left-joins payments.
-- ----------------------------------------------------------------------------
SELECT 
    o.order_id,
    c.customer_name,
    o.order_date,
    o.status AS order_status,
    SUM(oi.quantity * oi.unit_price) AS order_total,
    COALESCE(p.payment_status, 'UNPAID') AS payment_status,
    COALESCE(p.payment_method, 'NONE') AS payment_method
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN payments p ON o.order_id = p.order_id
GROUP BY o.order_id, c.customer_name, o.order_date, o.status, p.payment_status, p.payment_method
ORDER BY o.order_id;

-- ----------------------------------------------------------------------------
-- Module 2, Query 2: Monthly Successful-Payment Revenue (Appendix B.3)
-- Computes actual collected revenue (SUCCESS only) grouped by month.
-- ----------------------------------------------------------------------------
SELECT 
    TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') AS sales_month,
    COUNT(payment_id) AS successful_payments,
    SUM(amount) AS total_revenue
FROM payments
WHERE payment_status = 'SUCCESS'
GROUP BY DATE_TRUNC('month', payment_date)
ORDER BY DATE_TRUNC('month', payment_date);

-- ----------------------------------------------------------------------------
-- Module 3, Query 1: Product Sales Aggregation (Section 4.3)
-- Computes total units sold and revenue per product, excluding CANCELLED orders.
-- ----------------------------------------------------------------------------
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    SUM(oi.quantity) AS total_units_sold,
    SUM(oi.quantity * oi.unit_price) AS total_sales_value
FROM products p
JOIN order_items oi ON p.product_id = oi.product_id
JOIN orders o ON o.order_id = oi.order_id
WHERE o.status != 'CANCELLED'
GROUP BY p.product_id, p.product_name, p.category
ORDER BY total_units_sold DESC, total_sales_value DESC;

-- ----------------------------------------------------------------------------
-- Module 3, Query 2: Low-Stock Inventory Identification (Figure 8 / Appendix B.4)
-- Filters products whose stock is below replenishment threshold (< 5).
-- ----------------------------------------------------------------------------
SELECT 
    p.product_id,
    p.product_name,
    p.category,
    i.stock_quantity,
    'LOW STOCK' AS stock_status
FROM products p
JOIN inventory i ON i.product_id = p.product_id
WHERE i.stock_quantity < 5
ORDER BY i.stock_quantity;
