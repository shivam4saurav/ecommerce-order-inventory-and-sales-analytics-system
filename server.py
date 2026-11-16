#!/usr/bin/env python3
"""
E-Commerce Order, Inventory and Sales Analytics System
Full-Stack Web Application Server (Python + PostgreSQL 18)
"""

import os
import sys
import json
import subprocess
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

PROJECT_ROOT = os.path.abspath(os.path.dirname(__file__))
STATIC_DIR = os.path.join(PROJECT_ROOT, "static")
SQL_DIR = os.path.join(PROJECT_ROOT, "sql")
DB_NAME = "ecommerce_case_study"
DB_USER = "shivam_saurav"
PORT = 5050


def run_sql(query, is_json=False):
    """Executes SQL via psql and returns the output."""
    cmd = ["psql", "-U", DB_USER, "-d", DB_NAME, "-t", "-A", "-c", query]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return False, result.stderr.strip()
    out = result.stdout.strip()
    if is_json:
        try:
            return True, json.loads(out) if out else []
        except Exception as e:
            return True, out
    return True, out


def run_sql_file(file_path):
    cmd = ["psql", "-U", DB_USER, "-d", DB_NAME, "-f", file_path]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return res.returncode == 0, res.stdout + res.stderr


class ECommerceHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)

        if path.startswith("/api/"):
            self.handle_api_get(path, params)
        else:
            # Serve static files (fallback to index.html for SPA)
            file_path = os.path.join(STATIC_DIR, path.lstrip("/"))
            if not os.path.exists(file_path) or os.path.isdir(file_path):
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            data = json.loads(body)
        except Exception:
            data = {}

        if path.startswith("/api/"):
            self.handle_api_post(path, data)
        else:
            self.send_error(404, "Not Found")

    def send_json(self, data, status=200):
        payload = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.end_headers()
        self.wfile.write(payload)

    def handle_api_get(self, path, params):
        if path == "/api/stats":
            sql = """
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
            """
            ok, res = run_sql(sql, is_json=True)
            self.send_json(res if ok else {"error": res}, status=200 if ok else 500)

        elif path == "/api/orders":
            sql = """
            SELECT COALESCE(json_agg(t), '[]'::json) FROM (
                SELECT 
                    o.order_id,
                    c.customer_name,
                    c.city,
                    o.order_date,
                    o.status AS order_status,
                    SUM(oi.quantity * oi.unit_price) AS order_total,
                    COALESCE(p.payment_status, 'UNPAID') AS payment_status,
                    COALESCE(p.payment_method, 'NONE') AS payment_method,
                    COUNT(oi.order_item_id) AS item_count
                FROM orders o
                JOIN customers c ON o.customer_id = c.customer_id
                JOIN order_items oi ON o.order_id = oi.order_id
                LEFT JOIN payments p ON o.order_id = p.order_id
                GROUP BY o.order_id, c.customer_name, c.city, o.order_date, o.status, p.payment_status, p.payment_method
                ORDER BY o.order_id
            ) t;
            """
            ok, res = run_sql(sql, is_json=True)
            self.send_json(res if ok else {"error": res}, status=200 if ok else 500)

        elif path == "/api/order-items":
            order_id = params.get("order_id", [None])[0]
            where = f"WHERE oi.order_id = {int(order_id)}" if order_id else ""
            sql = f"""
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
                {where}
                ORDER BY oi.order_id, oi.order_item_id
            ) t;
            """
            ok, res = run_sql(sql, is_json=True)
            self.send_json(res if ok else {"error": res}, status=200 if ok else 500)

        elif path == "/api/inventory":
            sql = """
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
            """
            ok, res = run_sql(sql, is_json=True)
            self.send_json(res if ok else {"error": res}, status=200 if ok else 500)

        elif path == "/api/sales":
            sql = """
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
            """
            ok, res = run_sql(sql, is_json=True)
            self.send_json(res if ok else {"error": res}, status=200 if ok else 500)

        elif path == "/api/monthly-revenue":
            sql = """
            SELECT COALESCE(json_agg(t), '[]'::json) FROM (
                SELECT 
                    TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') AS sales_month,
                    COUNT(payment_id) AS successful_payments,
                    SUM(amount) AS total_revenue
                FROM payments
                WHERE payment_status = 'SUCCESS'
                GROUP BY DATE_TRUNC('month', payment_date)
                ORDER BY DATE_TRUNC('month', payment_date)
            ) t;
            """
            ok, res = run_sql(sql, is_json=True)
            self.send_json(res if ok else {"error": res}, status=200 if ok else 500)

        elif path == "/api/explain":
            mode = params.get("mode", ["default"])[0]
            prefix = "SET enable_seqscan = off;" if mode == "index" else ""
            suffix = "RESET enable_seqscan;" if mode == "index" else ""
            
            # Text plan
            query_text = f"{prefix} EXPLAIN ANALYZE SELECT * FROM order_items WHERE product_id = 2; {suffix}"
            ok, out_text = run_sql(query_text)
            
            # JSON plan
            query_json = f"{prefix} EXPLAIN (ANALYZE, FORMAT JSON) SELECT * FROM order_items WHERE product_id = 2; {suffix}"
            ok_j, out_json = run_sql(query_json, is_json=True)

            self.send_json({
                "mode": mode,
                "plan_text": out_text,
                "plan_json": out_json if ok_j else None
            })

        else:
            self.send_error(404, "Unknown API Endpoint")

    def handle_api_post(self, path, data):
        if path == "/api/inventory/update":
            product_id = data.get("product_id", 2)
            new_quantity = data.get("stock_quantity", 49)
            
            sql = f"""
            UPDATE inventory 
            SET stock_quantity = {int(new_quantity)} 
            WHERE product_id = {int(product_id)}
            RETURNING product_id, stock_quantity, TO_CHAR(last_updated, 'YYYY-MM-DD HH24:MI:SS.US') AS last_updated;
            """
            ok, out = run_sql(f"SELECT json_agg(t) FROM ({sql}) t;", is_json=True)
            self.send_json({"success": ok, "updated": out})

        elif path == "/api/transaction/test":
            mode = data.get("mode", "rollback")
            product_id = data.get("product_id", 2)
            
            if mode == "rollback":
                sql = f"""
                DO $$
                BEGIN
                    -- Start simulated block
                    UPDATE inventory SET stock_quantity = stock_quantity - 10 WHERE product_id = {product_id};
                    -- Simulate error/abort
                    RAISE EXCEPTION 'Intentional abort to trigger transaction rollback!';
                EXCEPTION WHEN OTHERS THEN
                    -- Caught: state rolled back automatically
                END $$;
                """
                run_sql(sql)
                # Check current state
                ok, state = run_sql(f"SELECT json_agg(t) FROM (SELECT product_id, stock_quantity, TO_CHAR(last_updated, 'YYYY-MM-DD HH24:MI:SS') AS last_updated FROM inventory WHERE product_id = {product_id}) t;", is_json=True)
                self.send_json({
                    "action": "rollback",
                    "status": "rolled_back",
                    "message": "Transaction safely aborted and rolled back. Inventory unchanged.",
                    "current_state": state[0] if state else {}
                })
            else:
                # Commit
                new_qty = data.get("quantity", 49)
                sql = f"""
                UPDATE inventory SET stock_quantity = {new_qty} WHERE product_id = {product_id}
                RETURNING product_id, stock_quantity, TO_CHAR(last_updated, 'YYYY-MM-DD HH24:MI:SS.US') AS last_updated;
                """
                ok, state = run_sql(f"SELECT json_agg(t) FROM ({sql}) t;", is_json=True)
                self.send_json({
                    "action": "commit",
                    "status": "committed",
                    "message": "Transaction committed successfully! Trigger updated last_updated.",
                    "current_state": state[0] if state else {}
                })

        elif path == "/api/reset":
            run_sql_file(os.path.join(SQL_DIR, "01_schema.sql"))
            run_sql_file(os.path.join(SQL_DIR, "02_seed_data.sql"))
            self.send_json({"success": True, "message": "Database successfully reset to initial benchmark state."})

        else:
            self.send_error(404, "Unknown API endpoint")


def run():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, ECommerceHandler)
    print(f"===========================================================================")
    print(f" E-Commerce ADBMS Case Study Web Server Running on port {PORT}")
    print(f" Dashboard URL: http://localhost:{PORT}")
    print(f" Connected to Database: {DB_NAME} (PostgreSQL 18)")
    print(f"===========================================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()


if __name__ == "__main__":
    run()
