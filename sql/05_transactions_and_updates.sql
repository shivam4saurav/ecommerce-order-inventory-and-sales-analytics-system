-- ============================================================================
-- E-Commerce Order, Inventory and Sales Analytics System
-- Script: 05_transactions_and_updates.sql
-- Description: Transaction control, rollback tests, and inventory update (Module 4).
-- DBMS: PostgreSQL 18
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Part 1: Transaction Rollback Demonstration (ACID Atomicity Test)
-- Simulates an aborted inventory update to verify rollback integrity.
-- ----------------------------------------------------------------------------
BEGIN;

-- Attempt stock decrement
UPDATE inventory
SET stock_quantity = stock_quantity - 5
WHERE product_id = 2;

-- Check modified in-transaction state (should show 45)
SELECT product_id, stock_quantity, last_updated 
FROM inventory 
WHERE product_id = 2;

-- Abort transaction
ROLLBACK;

-- Verify stock returned to original state (should show 50)
SELECT product_id, stock_quantity, last_updated 
FROM inventory 
WHERE product_id = 2;

-- ----------------------------------------------------------------------------
-- Part 2: Controlled Inventory Update & Trigger Timestamp Test (Figure 9)
-- Updates product_id 2 from 50 to 49, verifying trigger execution.
-- ----------------------------------------------------------------------------
BEGIN;

UPDATE inventory
SET stock_quantity = 49
WHERE product_id = 2;

COMMIT;

-- Verification matching Figure 9 pgAdmin Output
SELECT product_id, stock_quantity, last_updated
FROM inventory
WHERE product_id = 2;
