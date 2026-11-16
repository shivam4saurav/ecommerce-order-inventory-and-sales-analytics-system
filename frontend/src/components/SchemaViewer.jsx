import React from 'react';
import { 
  Database, 
  Key, 
  Table2, 
  Check, 
  Layers,
  Link,
  ShieldAlert
} from 'lucide-react';

export default function SchemaViewer() {
  const tables = [
    {
      name: 'customers',
      rows: 5,
      description: 'Customer profile repository and delivery address data',
      cols: [
        { name: 'customer_id', type: 'SERIAL', key: 'PK', detail: 'Primary Key' },
        { name: 'customer_name', type: 'VARCHAR(100)', key: 'NOT NULL', detail: 'Full customer name' },
        { name: 'email', type: 'VARCHAR(100)', key: 'UNIQUE', detail: 'Unique email address' },
        { name: 'phone', type: 'VARCHAR(20)', key: 'NOT NULL', detail: 'Contact number' },
        { name: 'city', type: 'VARCHAR(50)', key: 'NOT NULL', detail: 'Delivery city' },
      ]
    },
    {
      name: 'products',
      rows: 6,
      description: 'Master catalog records, pricing, and category classifications',
      cols: [
        { name: 'product_id', type: 'SERIAL', key: 'PK', detail: 'Primary Key' },
        { name: 'product_name', type: 'VARCHAR(120)', key: 'NOT NULL', detail: 'Product title' },
        { name: 'category', type: 'VARCHAR(60)', key: 'NOT NULL', detail: 'Classification' },
        { name: 'price', type: 'NUMERIC(10,2)', key: 'CHECK', detail: 'Base price >= 0' },
      ]
    },
    {
      name: 'inventory',
      rows: 6,
      description: 'Warehouse stock balances and trigger-updated audit timestamps',
      cols: [
        { name: 'inventory_id', type: 'SERIAL', key: 'PK', detail: 'Primary Key' },
        { name: 'product_id', type: 'INT', key: 'FK, UK', detail: '→ products.product_id' },
        { name: 'stock_quantity', type: 'INT', key: 'CHECK', detail: 'Quantity >= 0' },
        { name: 'last_updated', type: 'TIMESTAMP', key: 'TRIGGER', detail: 'PL/pgSQL auto-updated' },
      ]
    },
    {
      name: 'orders',
      rows: 6,
      description: 'Order headers capturing customer references and fulfillment state',
      cols: [
        { name: 'order_id', type: 'SERIAL', key: 'PK', detail: 'Primary Key' },
        { name: 'customer_id', type: 'INT', key: 'FK', detail: '→ customers.customer_id' },
        { name: 'order_date', type: 'DATE', key: 'NOT NULL', detail: 'Placement date' },
        { name: 'status', type: 'VARCHAR(20)', key: 'CHECK', detail: 'DELIVERED, SHIPPED, etc.' },
      ]
    },
    {
      name: 'order_items',
      rows: 10,
      description: 'Composite line-item relations preserving ordered unit pricing',
      cols: [
        { name: 'order_item_id', type: 'SERIAL', key: 'PK', detail: 'Primary Key' },
        { name: 'order_id', type: 'INT', key: 'FK', detail: '→ orders.order_id' },
        { name: 'product_id', type: 'INT', key: 'FK', detail: '→ products.product_id' },
        { name: 'quantity', type: 'INT', key: 'CHECK', detail: 'Quantity > 0' },
        { name: 'unit_price', type: 'NUMERIC(10,2)', key: 'CHECK', detail: 'Snapshot unit price' },
      ]
    },
    {
      name: 'payments',
      rows: 6,
      description: 'Financial transaction logs, settlement status, and instruments',
      cols: [
        { name: 'payment_id', type: 'SERIAL', key: 'PK', detail: 'Primary Key' },
        { name: 'order_id', type: 'INT', key: 'FK', detail: '→ orders.order_id' },
        { name: 'amount', type: 'NUMERIC(10,2)', key: 'CHECK', detail: 'Settlement sum >= 0' },
        { name: 'payment_method', type: 'VARCHAR(30)', key: 'NOT NULL', detail: 'UPI, CREDIT_CARD, etc.' },
        { name: 'payment_status', type: 'VARCHAR(20)', key: 'CHECK', detail: 'SUCCESS, FAILED, PENDING' },
        { name: 'payment_date', type: 'TIMESTAMP', key: 'NOT NULL', detail: 'Gateway timestamp' },
      ]
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
          <span>Relational Schema & Data Dictionary (Table 3.1)</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
            3NF Normalized
          </span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Six normalized relational tables in PostgreSQL 18 with referential constraints, CHECK validations, and automated triggers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((t) => (
          <div key={t.name} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
                <span className="font-mono text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Table2 className="w-4 h-4 text-zinc-400" /> {t.name}
                </span>
                <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">
                  {t.rows} rows
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">{t.description}</p>

              <div className="space-y-1">
                {t.cols.map((col) => (
                  <div key={col.name} className="flex items-center justify-between text-[11px] py-1 px-2 rounded bg-zinc-950/60 font-mono">
                    <span className="text-zinc-200 font-medium flex items-center gap-1">
                      {col.key.includes('PK') && <Key className="w-3 h-3 text-amber-400" />}
                      {col.key.includes('FK') && <Link className="w-3 h-3 text-blue-400" />}
                      {col.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-zinc-500">{col.type}</span>
                      {col.key && (
                        <span className="text-[9px] px-1 rounded bg-zinc-800 text-zinc-400">
                          {col.key}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
