import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  QrCode, 
  Building, 
  ShieldCheck, 
  ArrowRight,
  ShoppingBag,
  CheckCircle2
} from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cart, 
  onUpdateQty, 
  onRemoveItem, 
  customers, 
  onCheckout, 
  placingOrder 
}) {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers?.[0]?.customer_id || 1);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePay = () => {
    if (cart.length === 0) return;
    onCheckout({
      customer_id: selectedCustomerId,
      payment_method: paymentMethod,
      payment_status: 'SUCCESS',
      items: cart.map(i => ({
        product_id: i.product_id,
        quantity: i.quantity,
        unit_price: i.price
      }))
    });
  };

  const selectedCustomer = customers.find(c => c.customer_id === Number(selectedCustomerId)) || customers[0];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Shopping Cart</h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 mx-auto flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Your cart is currently empty</p>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Explore the catalog, select hardware gear, and test live checkout transaction processing.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 my-4 max-h-64 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.product_id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {item.product_name}
                    </h4>
                    <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                      ₹{Number(item.price).toLocaleString('en-IN')} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 p-0.5">
                    <button
                      onClick={() => onUpdateQty(item.product_id, item.quantity - 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-2 text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.product_id, item.quantity + 1)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className="text-[10px] text-rose-500 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Checkout Configuration: Customer & Payment */}
          {cart.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs">
              
              {/* Customer Selector */}
              <div>
                <label className="block text-[11px] uppercase font-mono font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Ordering Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.customer_name} — {c.city} ({c.email})
                    </option>
                  ))}
                </select>
                {selectedCustomer && (
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 font-mono">
                    Shipping to: {selectedCustomer.city}, India • Phone: {selectedCustomer.phone}
                  </p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] uppercase font-mono font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                  Payment Instrument
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI / QR', icon: QrCode },
                    { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
                    { id: 'NET_BANKING', label: 'Net Banking', icon: Building },
                  ].map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px]">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Checkout Summary & Trigger */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Shipping:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>GST (18% included):</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">
                  ₹{(subtotal * 0.18 / 1.18).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <button
              onClick={handlePay}
              disabled={placingOrder}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition flex items-center justify-center gap-2 active:scale-98"
            >
              {placingOrder ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment & Order...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize & Place Order (₹{subtotal.toLocaleString('en-IN')})</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-zinc-400 font-mono flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>256-bit encrypted checkout • Instant order confirmation</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
