import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Package, 
  Users, 
  CreditCard 
} from 'lucide-react';

export default function KPICards({ stats }) {
  if (!stats) return null;

  const gmv = Number(stats.total_order_value || 0);
  const realizedRevenue = Number(stats.successful_payment_revenue || 0);
  const pendingValue = gmv - realizedRevenue;
  const settlementRate = gmv > 0 ? ((realizedRevenue / gmv) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Realized Revenue */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Net Realized Revenue</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> Settled
          </span>
        </div>
        <div className="my-2.5">
          <div className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
            ₹{realizedRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold font-mono">5</span> of 6 orders settled via UPI / Cards
          </div>
        </div>
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Settlement Rate:</span>
          <span className="text-zinc-300 font-medium">{settlementRate}%</span>
        </div>
      </div>

      {/* Gross Merchandise Value */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Gross Merchandise Value (GMV)</span>
          <span className="text-[11px] text-zinc-400 font-mono">Oct 2026</span>
        </div>
        <div className="my-2.5">
          <div className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
            ₹{gmv.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
            Across <span className="text-zinc-200 font-semibold font-mono">{stats.total_orders}</span> placed orders ({stats.order_item_records} SKUs)
          </div>
        </div>
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Average Order Value:</span>
          <span className="text-zinc-300 font-medium">₹{(gmv / (stats.total_orders || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* Unsettled / Pending Orders */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Unsettled / Incomplete</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <Clock className="w-3 h-3" /> Attention
          </span>
        </div>
        <div className="my-2.5">
          <div className="text-2xl font-bold tracking-tight text-amber-400 font-mono">
            ₹{pendingValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            Order <span className="font-mono text-zinc-300 font-semibold">#ORD-3</span> pending (Payment status: FAILED)
          </div>
        </div>
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>At-Risk Volume:</span>
          <span className="text-amber-400/90 font-medium">{(100 - settlementRate).toFixed(1)}%</span>
        </div>
      </div>

      {/* Inventory & Safety Stock Health */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Inventory Replenishment</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            <AlertTriangle className="w-3 h-3" /> Reorder
          </span>
        </div>
        <div className="my-2.5">
          <div className="text-2xl font-bold tracking-tight text-zinc-100 font-mono">
            {stats.low_stock_products} <span className="text-sm font-normal text-zinc-400">SKUs Critical</span>
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">
            <span className="text-zinc-200 font-medium">Headphones (3)</span>, <span className="text-zinc-200 font-medium">Monitor (4)</span> &lt; 5 threshold
          </div>
        </div>
        <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Catalog SKUs:</span>
          <span className="text-zinc-300 font-medium">{stats.total_products} tracked</span>
        </div>
      </div>

    </div>
  );
}
