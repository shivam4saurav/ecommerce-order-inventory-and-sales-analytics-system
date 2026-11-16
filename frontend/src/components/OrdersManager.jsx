import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  ExternalLink, 
  X, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  Building2, 
  FileText,
  Search,
  ChevronRight,
  RefreshCw,
  RotateCcw
} from 'lucide-react';

export default function OrdersManager({ orders, onRefresh, onUpdateStatus, onReset, resetting }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [advancingId, setAdvancingId] = useState(null);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !searchQuery || 
        o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(o.order_id).includes(searchQuery);

      const matchStatus = statusFilter === 'ALL' || o.order_status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, searchQuery, statusFilter]);

  const openOrderDrawer = async (order) => {
    setSelectedOrder(order);
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/order-items?order_id=${order.order_id}`);
      const data = await res.json();
      setOrderItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingItems(false);
    }
  };

  const advanceOrderStatus = async (e, order) => {
    e.stopPropagation();
    let nextStatus = 'SHIPPED';
    if (order.order_status === 'PAID') nextStatus = 'SHIPPED';
    else if (order.order_status === 'SHIPPED') nextStatus = 'DELIVERED';
    else if (order.order_status === 'PENDING') nextStatus = 'PAID';
    else if (order.order_status === 'DELIVERED') return;

    setAdvancingId(order.order_id);
    try {
      await onUpdateStatus(order.order_id, nextStatus);
    } finally {
      setAdvancingId(null);
    }
  };

  const getFulfillmentBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'PAID':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-500" />
            <span>Orders & Fulfillment Dispatch</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono">
              {filteredOrders.length} records
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Comprehensive fulfillment pipeline, real-time settlement tracking, and customer dispatch operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative w-48 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by customer, city, ID..."
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none"
            />
          </div>

          <button
            onClick={onRefresh}
            className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 transition"
            title="Refresh database records"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Admin Baseline Reset Action */}
          {onReset && (
            <button
              onClick={onReset}
              disabled={resetting}
              className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-750 flex items-center gap-1.5 transition disabled:opacity-50"
              title="Restore initial benchmark database dataset"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-indigo-500' : 'text-zinc-500 dark:text-zinc-400'}`} />
              <span className="hidden sm:inline">{resetting ? 'Restoring...' : 'Restore Baseline'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['ALL', 'DELIVERED', 'SHIPPED', 'PAID', 'PENDING'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              statusFilter === st
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            {st === 'ALL' ? 'All Orders' : st}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300 border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-mono">
              <tr>
                <th className="px-4 py-3 font-medium">Order Ref</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Fulfillment Status</th>
                <th className="px-4 py-3 font-medium text-center">Settlement</th>
                <th className="px-4 py-3 font-medium text-right">Items</th>
                <th className="px-4 py-3 font-medium text-right">Total (INR)</th>
                <th className="px-4 py-3 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-zinc-400 text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const initials = o.customer_name
                    ?.split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase() || 'CU';
                  const isSuccess = o.payment_status === 'SUCCESS';
                  const canAdvance = o.order_status !== 'DELIVERED';

                  return (
                    <tr
                      key={o.order_id}
                      onClick={() => openOrderDrawer(o)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        #ORD-100{o.order_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                            {initials}
                          </div>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                            {o.customer_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {o.city}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                        {o.order_date}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getFulfillmentBadge(o.order_status)}`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {o.payment_status} ({o.payment_method})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400">
                        {o.item_count} SKU{o.item_count > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        ₹{Number(o.order_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {canAdvance ? (
                            <button
                              onClick={(e) => advanceOrderStatus(e, o)}
                              disabled={advancingId === o.order_id}
                              className="px-2 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-medium text-[11px] transition flex items-center gap-1"
                              title="Advance fulfillment status"
                            >
                              <span>Next Status</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-400 font-mono">Completed</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Invoice Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      Order #ORD-100{selectedOrder.order_id}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getFulfillmentBadge(selectedOrder.order_status)}`}>
                      {selectedOrder.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Placed on {selectedOrder.order_date} • Verified Electronic Order
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer & Settlement Metadata */}
              <div className="grid grid-cols-2 gap-4 my-5 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 text-xs">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Customer</span>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-1">{selectedOrder.customer_name}</div>
                  <div className="text-zinc-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {selectedOrder.city}, India
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-mono">Settlement Method</span>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                    {selectedOrder.payment_method}
                  </div>
                  <div className="mt-0.5">
                    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold ${
                      selectedOrder.payment_status === 'SUCCESS' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                    }`}>
                      ● {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Ordered Items ({orderItems.length})
                </h4>
                {loadingItems ? (
                  <div className="py-6 text-center text-xs text-zinc-500 font-mono">Retrieving order_items rows...</div>
                ) : (
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-950/40">
                    <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
                      <thead className="bg-zinc-100 dark:bg-zinc-950 text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 font-mono">
                        <tr>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
                        {orderItems.map((item) => (
                          <tr key={item.order_item_id}>
                            <td className="px-3 py-2.5">
                              <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.product_name}</div>
                              <div className="text-[10px] text-zinc-400 font-mono">SKU #{item.product_id} • {item.category}</div>
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono font-bold text-zinc-900 dark:text-zinc-100">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-zinc-500 dark:text-zinc-400">
                              ₹{Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                              ₹{Number(item.line_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Total */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Total Value:</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100 font-bold">
                  ₹{Number(selectedOrder.order_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-200 dark:border-zinc-800 font-mono">
                <span>Grand Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{Number(selectedOrder.order_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
