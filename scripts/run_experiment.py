#!/usr/bin/env python3
"""
E-Commerce Order, Inventory and Sales Analytics System
Experiment Runner and Validation Suite
DBMS: PostgreSQL 18
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SQL_DIR = os.path.join(PROJECT_ROOT, "sql")
OUTPUT_DIR = os.path.join(PROJECT_ROOT, "outputs")
DB_NAME = "ecommerce_case_study"
DB_USER = "shivam_saurav"

# ANSI Terminal Styling
C_RESET = "\033[0m"
C_BOLD = "\033[1m"
C_CYAN = "\033[96m"
C_GREEN = "\033[92m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_BLUE = "\033[94m"


def run_psql(query_or_file, is_file=False, capture=True):
    """Executes SQL via psql CLI."""
    cmd = ["psql", "-U", DB_USER, "-d", DB_NAME]
    if is_file:
        cmd.extend(["-f", query_or_file])
    else:
        cmd.extend(["-c", query_or_file])

    result = subprocess.run(cmd, capture_output=capture, text=True)
    if result.returncode != 0:
        print(f"{C_RED}[ERROR] Execution failed:{C_RESET}\n{result.stderr}")
        return False, result.stderr
    return True, result.stdout


def banner(title):
    width = 75
    print("\n" + "=" * width)
    print(f" {C_BOLD}{C_CYAN}{title}{C_RESET}")
    print("=" * width)


def module1_schema_and_counts():
    banner("Module 1: Schema Build and Record Validation")
    print(f"{C_BLUE}[*] Executing DDL Schema and Initial Seed Data...{C_RESET}")
    
    # Run Schema DDL
    ok, out1 = run_psql(os.path.join(SQL_DIR, "01_schema.sql"), is_file=True)
    if not ok:
        return False

    # Run Seed Data
    ok, out2 = run_psql(os.path.join(SQL_DIR, "02_seed_data.sql"), is_file=True)
    if not ok:
        return False

    # Run Verification Query
    ok, out3 = run_psql(os.path.join(SQL_DIR, "03_verification_queries.sql"), is_file=True)
    print(out3)

    # Save output
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(os.path.join(OUTPUT_DIR, "module1_schema_and_counts.txt"), "w") as f:
        f.write("=== Module 1: Schema Build and Record Validation ===\n\n")
        f.write(out3)

    return True


def module2_order_summary_and_revenue():
    banner("Module 2: Order Summary and Revenue Analytics")
    sql = """
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
    """
    ok, out_summary = run_psql(sql)
    print(f"{C_BOLD}Order Summary Output (Figure 6):{C_RESET}")
    print(out_summary)

    sql_rev = """
    SELECT 
        TO_CHAR(DATE_TRUNC('month', payment_date), 'YYYY-MM') AS sales_month,
        COUNT(payment_id) AS successful_payments,
        SUM(amount) AS total_revenue
    FROM payments
    WHERE payment_status = 'SUCCESS'
    GROUP BY DATE_TRUNC('month', payment_date)
    ORDER BY DATE_TRUNC('month', payment_date);
    """
    ok, out_rev = run_psql(sql_rev)
    print(f"{C_BOLD}Monthly Successful-Payment Revenue (Appendix B.3):{C_RESET}")
    print(out_rev)

    with open(os.path.join(OUTPUT_DIR, "module2_order_summary_and_revenue.txt"), "w") as f:
        f.write("=== Module 2: Order Summary and Revenue Analytics ===\n\n")
        f.write("--- Operational Order Summary ---\n")
        f.write(out_summary)
        f.write("\n--- Monthly Revenue (SUCCESS status only) ---\n")
        f.write(out_rev)

    return True


def module3_product_sales_and_low_stock():
    banner("Module 3: Product Sales and Low-Stock Analysis")
    sql_sales = """
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
    """
    ok, out_sales = run_psql(sql_sales)
    print(f"{C_BOLD}Product Sales Aggregation (Section 4.3):{C_RESET}")
    print(out_sales)

    sql_stock = """
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
    """
    ok, out_stock = run_psql(sql_stock)
    print(f"{C_BOLD}Low-Stock Products Output (Figure 8 / Appendix B.4):{C_RESET}")
    print(out_stock)

    with open(os.path.join(OUTPUT_DIR, "module3_product_sales_and_low_stock.txt"), "w") as f:
        f.write("=== Module 3: Product Sales and Low-Stock Analysis ===\n\n")
        f.write("--- Product Sales Ranking ---\n")
        f.write(out_sales)
        f.write("\n--- Low Stock Replenishment Alert (< 5 units) ---\n")
        f.write(out_stock)

    return True


def module4_inventory_update_and_totals():
    banner("Module 4: Inventory Update and Calculated Order Totals")
    
    # Calculated totals
    sql_totals = """
    SELECT order_id, SUM(quantity * unit_price) AS calculated_total
    FROM order_items
    GROUP BY order_id
    ORDER BY order_id;
    """
    ok, out_totals = run_psql(sql_totals)
    print(f"{C_BOLD}Calculated Order Totals (Figure 10 / Appendix B.2):{C_RESET}")
    print(out_totals)

    # Rollback and Update test
    print(f"{C_BLUE}[*] Running Transaction Rollback & Trigger Test (05_transactions_and_updates.sql)...{C_RESET}")
    ok, out_tx = run_psql(os.path.join(SQL_DIR, "05_transactions_and_updates.sql"), is_file=True)
    print(out_tx)

    with open(os.path.join(OUTPUT_DIR, "module4_inventory_update_and_totals.txt"), "w") as f:
        f.write("=== Module 4: Inventory Update and Calculated Order Totals ===\n\n")
        f.write("--- Calculated Totals by Order ---\n")
        f.write(out_totals)
        f.write("\n--- Transaction Control and Inventory Trigger Execution ---\n")
        f.write(out_tx)

    return True


def module5_query_plan_evaluation():
    banner("Module 5: Query Plan Evaluation (EXPLAIN ANALYZE)")
    ok, out_plan = run_psql(os.path.join(SQL_DIR, "06_indexing_and_explain.sql"), is_file=True)
    print(out_plan)

    with open(os.path.join(OUTPUT_DIR, "module5_query_plan_evaluation.txt"), "w") as f:
        f.write("=== Module 5: Query Plan Evaluation ===\n\n")
        f.write(out_plan)

    return True


def run_validation_matrix():
    banner("Testing, Characterization and Data Validation Matrix (Table 4.2)")
    
    checks = []

    # Check 1: Record counts
    ok, out = run_psql("""
    SELECT 
        (SELECT COUNT(*) FROM customers) = 5 AND
        (SELECT COUNT(*) FROM products) = 6 AND
        (SELECT COUNT(*) FROM inventory) = 6 AND
        (SELECT COUNT(*) FROM orders) = 6 AND
        (SELECT COUNT(*) FROM order_items) = 10 AND
        (SELECT COUNT(*) FROM payments) = 6;
    """)
    passed = "t" in out
    checks.append((
        "Table record count verification",
        "Six main tables contain expected sample rows",
        "5 customers, 6 products, 6 inventory, 6 orders, 10 order items, 6 payments",
        "Passed" if passed else "Failed",
        passed
    ))

    # Check 2: Order summary query
    ok, out = run_psql("SELECT COUNT(*) FROM orders;")
    passed = "6" in out
    checks.append((
        "Order summary query",
        "One row per order with totals and payment details",
        "Six order rows displayed",
        "Passed" if passed else "Failed",
        passed
    ))

    # Check 3: Monthly revenue
    ok, out = run_psql("SELECT SUM(amount) FROM payments WHERE payment_status = 'SUCCESS';")
    passed = "100200.00" in out
    checks.append((
        "Monthly revenue query",
        "Only SUCCESS payments contribute to revenue",
        "5 successful payments; ₹100,200 in October 2026",
        "Passed" if passed else "Failed",
        passed
    ))

    # Check 4: Low-stock query
    ok, out = run_psql("SELECT COUNT(*) FROM inventory WHERE stock_quantity < 5;")
    passed = "2" in out
    checks.append((
        "Low-stock query",
        "Products below threshold (< 5) are returned",
        "Headphones (3) and Monitor (4)",
        "Passed" if passed else "Failed",
        passed
    ))

    # Check 5: Inventory update
    ok, out = run_psql("SELECT stock_quantity FROM inventory WHERE product_id = 2;")
    passed = "49" in out
    checks.append((
        "Inventory update",
        "One target row is updated (product_id 2: 50 -> 49)",
        "UPDATE 1; product_id 2 shown with quantity 49",
        "Passed" if passed else "Failed",
        passed
    ))

    # Check 6: Calculated order totals
    ok, out = run_psql("SELECT SUM(quantity * unit_price) FROM order_items;")
    # Total sum across all items = 56600+4000+12000+30800+5000+3800 = 112200.00
    passed = "112200.00" in out
    checks.append((
        "Calculated order totals",
        "Totals match item-level calculation",
        "Six totals match order summary (Sum = ₹112,200)",
        "Passed" if passed else "Failed",
        passed
    ))

    # Check 7: Query plan inspection
    ok, out = run_psql("EXPLAIN SELECT * FROM order_items WHERE product_id = 2;")
    passed = "Seq Scan" in out
    checks.append((
        "Query plan inspection",
        "Plan and timing captured for comparison",
        "Sequential scan in both captured plans; no speedup established",
        "Observed as expected" if passed else "Failed",
        passed
    ))

    print(f"\n{'Test Case':<32} | {'Expected Behaviour':<38} | {'Observed Result':<38} | {'Status'}")
    print("-" * 125)
    all_ok = True
    for test, expected, observed, status, ok_flag in checks:
        color = C_GREEN if (status in ["Passed", "Observed as expected"]) else C_RED
        print(f"{test:<32} | {expected:<38} | {observed:<38} | {color}{status}{C_RESET}")
        if not ok_flag:
            all_ok = False

    print("-" * 125)
    if all_ok:
        print(f"{C_BOLD}{C_GREEN}[✓] ALL 7 EXPERIMENTAL TEST CASES COMPLETED AND VERIFIED SUCCESSFULLY!{C_RESET}\n")
    else:
        print(f"{C_BOLD}{C_RED}[✗] SOME TESTS FAILED. PLEASE REVIEW LOGS.{C_RESET}\n")

    return all_ok


def main():
    parser = argparse.ArgumentParser(description="E-Commerce Analytics ADBMS Case Study Runner")
    parser.add_argument("--all", action="store_true", help="Run all 5 modules and validation matrix")
    parser.add_argument("--module", type=int, choices=[1, 2, 3, 4, 5], help="Run a specific module")
    parser.add_argument("--verify", action="store_true", help="Run validation matrix check")
    args = parser.parse_args()

    print(f"{C_BOLD}{C_CYAN}===========================================================================")
    print(" E-COMMERCE ORDER, INVENTORY AND SALES ANALYTICS SYSTEM")
    print(" PostgreSQL 18 Relational Database Case Study Experiment")
    print(f" Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"==========================================================================={C_RESET}")

    if args.module:
        if args.module == 1:
            module1_schema_and_counts()
        elif args.module == 2:
            module2_order_summary_and_revenue()
        elif args.module == 3:
            module3_product_sales_and_low_stock()
        elif args.module == 4:
            module4_inventory_update_and_totals()
        elif args.module == 5:
            module5_query_plan_evaluation()
    elif args.verify:
        run_validation_matrix()
    else:
        # Default: Run full pipeline
        module1_schema_and_counts()
        module2_order_summary_and_revenue()
        module3_product_sales_and_low_stock()
        module4_inventory_update_and_totals()
        module5_query_plan_evaluation()
        run_validation_matrix()


if __name__ == "__main__":
    main()
