#!/usr/bin/env bash
# ==============================================================================
# E-Commerce Order, Inventory and Sales Analytics System
# Shell Automation Script to Perform the Experiment
# DBMS: PostgreSQL 18
# ==============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_NAME="ecommerce_case_study"
DB_USER="$(whoami)"

echo "==========================================================================="
echo " Starting E-Commerce Analytics Database Experiment Execution"
echo " Database: ${DB_NAME} | User: ${DB_USER}"
echo "==========================================================================="

# Ensure database exists
if ! psql -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
    echo "[+] Database ${DB_NAME} does not exist. Creating..."
    createdb -U "${DB_USER}" "${DB_NAME}"
fi

# Run python experiment runner
python3 "${SCRIPT_DIR}/scripts/run_experiment.py" "$@" | tee "${SCRIPT_DIR}/outputs/full_experiment_execution.log"

echo "==========================================================================="
echo " Execution finished successfully! Logs saved to outputs/full_experiment_execution.log"
echo "==========================================================================="
