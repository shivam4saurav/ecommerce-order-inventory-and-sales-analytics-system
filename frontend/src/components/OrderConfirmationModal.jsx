import React from 'react';
import { 
  CheckCircle2, 
  Package, 
  ArrowRight, 
  ExternalLink, 
  Receipt, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';

export default function OrderConfirmationModal({ order, onClose, onViewInAdmin }) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 transition-colors">
        
        {/* Animated Checkmark */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3 h-3" /> Transaction Committed
          </span>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Order Placed Successfully!
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Your payment has been settled and your order is being prepared for shipment.
          </p>
        </div>

        {/* Order Receipt Card */}
        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500">Order Reference:</span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">#ORD-100{order.order_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Customer:</span>
            <span className="text-zinc-700 dark:text-zinc-300">{order.customer_name} ({order.city})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Payment Status:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{order.payment_status} ({order.payment_method})</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800 text-sm">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">Amount Paid:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              ₹{Number(order.order_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 text-left bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl space-y-1 font-mono">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Payment verified and settled
          </div>
          <div>✓ Order routed to warehouse for packaging</div>
          <div>✓ Real-time inventory balance updated</div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onClose}
            className="py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-xs transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={onViewInAdmin}
            className="py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs shadow-md transition flex items-center justify-center gap-1.5"
          >
            View in Admin <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
