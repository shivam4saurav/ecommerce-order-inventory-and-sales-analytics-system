// ==============================================================================
// E-Commerce Order, Inventory and Sales Analytics System
// Full-Stack Node.js + Express API Server (Cloud & Local Ready)
// Database: PostgreSQL (Cloud DATABASE_URL or Local ecommerce_case_study)
// ==============================================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5050;
const PROJECT_ROOT = __dirname;
const SQL_DIR = path.join(PROJECT_ROOT, 'sql');
const DIST_DIR = path.join(PROJECT_ROOT, 'frontend', 'dist');

app.use(cors());
app.use(express.json());

// ----------------------------------------------------------------------------
// PostgreSQL Pool Configuration (Supports Cloud DATABASE_URL and Local Sockets)
// ----------------------------------------------------------------------------
let pool;

if (process.env.DATABASE_URL) {
  // Cloud deployment (Render, Railway, Neon, etc.)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });
} else {
  // Local development
  pool = new Pool({
    database: process.env.DB_NAME || 'ecommerce_case_study',
    user: process.env.DB_USER || process.env.USER || 'shivam_saurav',
    host: process.env.DB_HOST || '/tmp',
    port: parseInt(process.env.DB_PORT || '5432', 10)
  });
}

// Helper to execute SQL queries and extract JSON/aggregate result
async function runSql(query) {
  const result = await pool.query(query);
  if (!result.rows || result.rows.length === 0) return null;
  const firstVal = Object.values(result.rows[0])[0];
  if (typeof firstVal === 'string') {
    try {
      return JSON.parse(firstVal);
    } catch {
      return firstVal;
    }
  }
  return firstVal;
}

// Helper to execute SQL script files
async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  await pool.query(sql);
}

// Initialize tables on startup if database is brand new (e.g. freshly created on Render)
async function initDatabase() {
  try {
    const checkRes = await pool.query("SELECT to_regclass('public.customers') AS exists;");
    if (!checkRes.rows[0].exists) {
      console.log('▶ Empty database detected. Initializing schema and seed data...');
      await runSqlFile(path.join(SQL_DIR, '01_schema.sql'));
      await runSqlFile(path.join(SQL_DIR, '02_seed_data.sql'));
      console.log('✔ Database initialized successfully with benchmark dataset.');
    } else {
      console.log('✔ Connected to active PostgreSQL database.');
    }
  } catch (err) {
    console.warn('Database initialization note:', err.message);
  }
}

// ----------------------------------------------------------------------------
// API Endpoints
// ----------------------------------------------------------------------------

// 1. KPI Stats Summary
app.get('/api/stats', async (req, res) => {
  try {
    const sql = `
      SELECT json_build_object(
        'total_customers', (SELECT COUNT(*) FROM customers),
        'total_products', (SELECT COUNT(*) FROM products),
        'inventory_records', (SELECT COUNT(*) FROM inventory),
        'total_orders', (SELECT COUNT(*) FROM orders),
        'order_item_records', (SELECT COUNT(*) FROM order_items),
        'payment_records', (SELECT COUNT(*) FROM payments),
        'successful_payment_revenue', (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'SUCCESS'),
        'low_stock_products', (SELECT COUNT(*) FROM inventory WHERE stock_quantity < 5),
        'total_order_value', (SELECT COALESCE(SUM(quantity * unit_price), 0) FROM order_items)
      );
    `;
    const result = await runSql(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 2. Customers List
app.get('/api/customers', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT 
          c.customer_id, 
          c.customer_name, 
          c.email, 
          c.phone, 
          c.city,
          COUNT(DISTINCT o.order_id) AS total_orders,
          COALESCE(SUM(p.amount), 0) AS total_spent
        FROM customers c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        LEFT JOIN payments p ON o.order_id = p.order_id AND p.payment_status = 'SUCCESS'
        GROUP BY c.customer_id, c.customer_name, c.email, c.phone, c.city
        ORDER BY c.customer_id
      ) t;
    `;
    const result = await runSql(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 3. Products Catalog with Live Stock
app.get('/api/products', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT 
          p.product_id,
          p.product_name,
          p.category,
          p.price,
          COALESCE(i.stock_quantity, 0) AS stock_quantity,
          TO_CHAR(i.last_updated, 'YYYY-MM-DD HH24:MI:SS') AS last_updated
        FROM products p
        LEFT JOIN inventory i ON p.product_id = i.product_id
        ORDER BY p.product_id
      ) t;
    `;
    const result = await runSql(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 4. Orders List
app.get('/api/orders', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT 
          o.order_id,
          c.customer_name,
          c.city,
          o.order_date,
          o.status AS order_status,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS order_total,
          COALESCE(p.payment_status, 'UNPAID') AS payment_status,
          COALESCE(p.payment_method, 'NONE') AS payment_method,
          COUNT(oi.order_item_id) AS item_count
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        LEFT JOIN order_items oi ON o.order_id = oi.order_id
        LEFT JOIN payments p ON o.order_id = p.order_id
        GROUP BY o.order_id, c.customer_name, c.city, o.order_date, o.status, p.payment_status, p.payment_method
        ORDER BY o.order_id DESC
      ) t;
    `;
    const result = await runSql(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 5. Order Line Items
app.get('/api/order-items', async (req, res) => {
  try {
    const orderId = req.query.order_id ? parseInt(req.query.order_id, 10) : null;
    const where = orderId ? `WHERE oi.order_id = ${orderId}` : '';
    const sql = `
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT 
          oi.order_item_id,
          oi.order_id,
          oi.product_id,
          p.product_name,
          p.category,
          oi.quantity,
          oi.unit_price,
          (oi.quantity * oi.unit_price) AS line_total
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        ${where}
        ORDER BY oi.order_id, oi.order_item_id
      ) t;
    `;
    const result = await runSql(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 6. Inventory Matrix
app.get('/api/inventory', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT 
          p.product_id,
          p.product_name,
          p.category,
          p.price,
          i.inventory_id,
          i.stock_quantity,
          TO_CHAR(i.last_updated, 'YYYY-MM-DD HH24:MI:SS') AS last_updated,
          CASE WHEN i.stock_quantity < 5 THEN 'LOW STOCK' ELSE 'OPTIMAL' END AS stock_status
        FROM products p
        JOIN inventory i ON p.product_id = i.product_id
        ORDER BY p.product_id
      ) t;
    `;
    const result = await runSql(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 7. Product Sales Velocity
app.get('/api/sales', async (req, res) => {
  try {
    const sql = `
      SELECT COALESCE(json_agg(t), '[]'::json) FROM (
        SELECT 
          p.product_id,
          p.product_name,
          p.category,
          p.price,
          COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
          COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total_sales_value
        FROM products p
        LEFT JOIN order_items oi ON p.product_id = oi.product_id
        LEFT JOIN orders o ON o.order_id = oi.order_id AND o.status != 'CANCELLED'
        GROUP BY p.product_id, p.product_name, p.category, p.price
        ORDER BY total_units_sold DESC, total_sales_value DESC
      ) t;
    `;
    const result = await runSql(sql);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 8. Create Order & Process Checkout (Atomic ACID Transaction)
app.post('/api/orders/create', async (req, res) => {
  const { customer_id, items, payment_method, payment_status } = req.body;
  if (!customer_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Customer ID and at least one item are required.' });
  }

  const custId = parseInt(customer_id, 10);
  const payMethod = payment_method || 'UPI';
  const payStatus = payment_status || 'SUCCESS';
  const initialOrderStatus = payStatus === 'SUCCESS' ? 'PAID' : 'PENDING';

  let orderTotal = 0;
  for (const it of items) {
    orderTotal += (it.quantity || 1) * Number(it.unit_price || 0);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Insert order header
    const orderRes = await client.query(
      `INSERT INTO orders (customer_id, order_date, status)
       VALUES ($1, CURRENT_DATE, $2)
       RETURNING order_id, order_date, status`,
      [custId, initialOrderStatus]
    );
    const newOrderId = orderRes.rows[0].order_id;

    // 2. Insert line items & decrement inventory
    for (const it of items) {
      const pid = parseInt(it.product_id, 10);
      const qty = parseInt(it.quantity, 10);
      const price = Number(it.unit_price).toFixed(2);

      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [newOrderId, pid, qty, price]
      );

      await client.query(
        `UPDATE inventory
         SET stock_quantity = GREATEST(0, stock_quantity - $1)
         WHERE product_id = $2`,
        [qty, pid]
      );
    }

    // 3. Record payment transaction
    await client.query(
      `INSERT INTO payments (order_id, amount, payment_method, payment_status, payment_date)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [newOrderId, orderTotal.toFixed(2), payMethod, payStatus]
    );

    await client.query('COMMIT');

    // 4. Fetch the newly created order
    const getOrderSql = `
      SELECT json_agg(t) FROM (
        SELECT 
          o.order_id,
          c.customer_name,
          c.city,
          o.order_date,
          o.status AS order_status,
          ${orderTotal.toFixed(2)} AS order_total,
          '${payStatus}' AS payment_status,
          '${payMethod}' AS payment_method
        FROM orders o
        JOIN customers c ON o.customer_id = c.customer_id
        WHERE o.order_id = ${newOrderId}
      ) t;
    `;
    const createdResult = await runSql(getOrderSql);
    const createdOrder = createdResult?.[0] || {};

    res.json({
      success: true,
      message: 'Order placed and settled successfully!',
      order: createdOrder
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: String(err) });
  } finally {
    client.release();
  }
});

// 9. Update Order Status
app.post('/api/orders/update-status', async (req, res) => {
  const { order_id, status } = req.body;
  if (!order_id || !status) {
    return res.status(400).json({ error: 'Order ID and status are required.' });
  }

  try {
    const sql = `
      WITH t AS (
        UPDATE orders
        SET status = '${status}'
        WHERE order_id = ${parseInt(order_id, 10)}
        RETURNING order_id, status
      )
      SELECT COALESCE(json_agg(t), '[]'::json) FROM t;
    `;
    const result = await runSql(sql);
    res.json({ success: true, updated: result });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 10. Update Stock Quantity
app.post('/api/inventory/update', async (req, res) => {
  try {
    const productId = parseInt(req.body.product_id || 2, 10);
    const newQuantity = parseInt(req.body.stock_quantity || 49, 10);
    const sql = `
      WITH t AS (
        UPDATE inventory 
        SET stock_quantity = ${newQuantity} 
        WHERE product_id = ${productId}
        RETURNING product_id, stock_quantity, TO_CHAR(last_updated, 'YYYY-MM-DD HH24:MI:SS.US') AS last_updated
      )
      SELECT COALESCE(json_agg(t), '[]'::json) FROM t;
    `;
    const result = await runSql(sql);
    res.json({ success: true, updated: result });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// 11. Reset Database to Benchmark Dataset
app.post('/api/reset', async (req, res) => {
  try {
    await runSqlFile(path.join(SQL_DIR, '01_schema.sql'));
    await runSqlFile(path.join(SQL_DIR, '02_seed_data.sql'));
    res.json({ success: true, message: 'Database reset to initial sample state.' });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// Serve frontend dist in production
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`===========================================================================`);
    console.log(` Meridian Commerce Full-Stack Application Server`);
    console.log(` Listening on: http://localhost:${PORT}`);
    console.log(` Database: ${process.env.DATABASE_URL ? 'Cloud PostgreSQL (DATABASE_URL)' : 'Local PostgreSQL'}`);
    console.log(`===========================================================================`);
  });
});

module.exports = app;
