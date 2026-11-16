import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Minus,
  Sparkles,
  Zap,
  Search,
  RefreshCw
} from 'lucide-react';

export default function InventoryManager({ inventory, onUpdateStock, onRefresh }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUpdate = async (productId, newQty, reason = "Manual Adjustment") => {
    setUpdatingId(productId);
    setFeedback(null);
    try {
      const res = await onUpdateStock(productId, newQty);
      if (res && res.updated && res.updated[0]) {
        const u = res.updated[0];
        setFeedback({
          productId: u.product_id,
          quantity: u.stock_quantity,
          timestamp: u.last_updated,
          reason
        });
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = inventory.filter(i => 
    !searchTerm ||
    i.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-500" />
            <span>Warehouse Stock Levels & Replenishment</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono">
              6 SKUs
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Real-time physical stock counts, automated reorder triggers, and warehouse replenishment tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter stock by SKU or name..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none"
            />
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition"
            title="Refresh stock levels"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Trigger Feedback Toast */}
      {feedback && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between font-mono animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Updated SKU #{feedback.productId} to <strong>{feedback.quantity} units</strong>! System audit timestamp: <code>{feedback.timestamp}</code>
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold">{feedback.reason}</span>
        </div>
      )}

      {/* Stock Matrix Table */}
      <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300 border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-mono">
              <tr>
                <th className="px-4 py-3 font-medium">SKU ID</th>
                <th className="px-4 py-3 font-medium">Product Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Unit Price</th>
                <th className="px-4 py-3 font-medium text-center">On-Hand Stock</th>
                <th className="px-4 py-3 font-medium">Capacity & Status</th>
                <th className="px-4 py-3 font-medium">Last Inventory Audit</th>
                <th className="px-4 py-3 font-medium text-center">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
              {filtered.map((item) => {
                const isLow = item.stock_quantity < 5;
                const maxCap = 50;
                const percent = Math.min(100, Math.round((item.stock_quantity / maxCap) * 100));

                return (
                  <tr key={item.product_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      SKU-00{item.product_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{item.product_name}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
                      ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        <span className={`font-mono text-sm font-bold ${
                          isLow ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'
                        }`}>
                          {item.stock_quantity}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">units</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`font-bold uppercase tracking-wider ${
                            isLow ? 'text-rose-500 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {isLow ? 'Reorder Alert (< 5)' : 'In Stock'}
                          </span>
                          <span className="text-zinc-400 font-mono">{percent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isLow ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                      {item.last_updated}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="inline-flex rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-0.5">
                        <button
                          onClick={() => handleUpdate(item.product_id, Math.max(0, item.stock_quantity - 1), "Decrement -1")}
                          disabled={updatingId !== null}
                          className="px-2 py-0.5 text-xs font-mono hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 transition"
                          title="Decrement stock"
                        >
                          -1
                        </button>
                        <span className="w-px h-3 bg-zinc-200 dark:bg-zinc-700 my-auto"></span>
                        <button
                          onClick={() => handleUpdate(item.product_id, item.stock_quantity + 1, "Restock +1")}
                          disabled={updatingId !== null}
                          className="px-2 py-0.5 text-xs font-mono hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-zinc-700 dark:text-zinc-300 transition"
                          title="Restock +1"
                        >
                          +1
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
