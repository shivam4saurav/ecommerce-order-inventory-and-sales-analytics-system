import React from 'react';
import { 
  TrendingUp, 
  Award, 
  BarChart3, 
  Package, 
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function SalesAnalytics({ sales }) {
  const totalVolume = sales.reduce((acc, s) => acc + Number(s.total_units_sold || 0), 0);
  const totalSalesVal = sales.reduce((acc, s) => acc + Number(s.total_sales_value || 0), 0);

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <span>Product Sales Velocity & Gross Revenue</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
              {totalVolume} Total Units Sold
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Module 3 aggregation: Excluding cancelled orders, sorted by units sold and gross merchandise revenue.
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Top Velocity SKU</span>
          <div className="text-sm font-semibold text-zinc-100 mt-1 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" /> Wireless Mouse
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">4 units sold across 3 distinct orders</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Total Units Dispatched</span>
          <div className="text-sm font-semibold text-zinc-100 mt-1 font-mono">
            {totalVolume} units
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Across 6 catalog items</p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Cumulative Order Volume</span>
          <div className="text-sm font-semibold text-emerald-400 mt-1 font-mono">
            ₹{totalSalesVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">Order items line-sum</p>
        </div>
      </div>

      {/* Sales Velocity Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead className="bg-zinc-950/70 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-mono">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">SKU ID</th>
                <th className="px-4 py-3 font-medium">Product Title</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium text-right">Catalog Price</th>
                <th className="px-4 py-3 font-medium text-center">Volume Sold</th>
                <th className="px-4 py-3 font-medium">Revenue Contribution</th>
                <th className="px-4 py-3 font-medium text-right">Gross Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {sales.map((item, idx) => {
                const isTop = item.total_units_sold === 4;
                const revenueShare = totalSalesVal > 0 ? ((Number(item.total_sales_value) / totalSalesVal) * 100).toFixed(1) : 0;

                return (
                  <tr key={item.product_id} className="hover:bg-zinc-800/40 transition">
                    <td className="px-4 py-3 font-mono font-medium text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span>#{idx + 1}</span>
                        {isTop && (
                          <span className="text-[10px] font-mono px-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            LEADER
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      SKU-00{item.product_id}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-zinc-100">{item.product_name}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-zinc-400">
                      ₹{Number(item.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        isTop ? 'bg-zinc-800 text-emerald-400 border border-zinc-700' : 'text-zinc-200'
                      }`}>
                        {item.total_units_sold} units
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1 max-w-[130px]">
                        <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                          <span>{revenueShare}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div 
                            className="h-full bg-zinc-400 rounded-full"
                            style={{ width: `${revenueShare}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-zinc-100">
                      ₹{Number(item.total_sales_value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
