-- ============================================================================
-- E-Commerce Order, Inventory and Sales Analytics System
-- Script: 06_indexing_and_explain.sql
-- Description: Query plan inspection, index creation, and planner evaluation (Module 5).
-- DBMS: PostgreSQL 18
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Part 1: Query Plan Inspection BEFORE Custom Index (Figure 11 / Appendix B.5)
-- Inspects planner cost and execution strategy on small sample relation.
-- ----------------------------------------------------------------------------
EXPLAIN ANALYZE
SELECT *
FROM order_items
WHERE product_id = 2;

-- ----------------------------------------------------------------------------
-- Part 2: Create B-Tree Index on Foreign Key Column
-- ----------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_order_items_product_id;
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Update statistics for planner
ANALYZE order_items;

-- ----------------------------------------------------------------------------
-- Part 3: Query Plan Inspection AFTER Custom Index (Figure 12)
-- Demonstrates that PostgreSQL still selects Sequential Scan due to table size (10 rows).
-- ----------------------------------------------------------------------------
EXPLAIN ANALYZE
SELECT *
FROM order_items
WHERE product_id = 2;

-- ----------------------------------------------------------------------------
-- Part 4: Comparative Demonstration with Forced Index Scan (enable_seqscan = off)
-- Proves index structure is functional while explaining why planner preferred Seq Scan.
-- ----------------------------------------------------------------------------
SET enable_seqscan = off;

EXPLAIN ANALYZE
SELECT *
FROM order_items
WHERE product_id = 2;

RESET enable_seqscan;
