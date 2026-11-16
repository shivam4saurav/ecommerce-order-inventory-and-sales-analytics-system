import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  ExternalLink, 
  X, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Filter,
  ArrowUpDown,
  Building2,
  Mail,
  Phone,
  FileText
} from 'lucide-react';

export default function OrdersTable({ orders, onRefresh, searchQuery }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  // Filter orders based on status, payment, and global search query
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = !searchQuery || 
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(o.order_id).includes(searchQuery);

      const matchStatus = statusFilter === 'ALL' || o.order_status === statusFilter;
      const matchPayment = paymentFilter === 'ALL' || o.payment_status === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    });
  }, [orders, searchQuery, statusFilter, paymentFilter]);

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

  const getFulfillmentBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SHIPPED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PAID':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
            <span>Orders & Transactions</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
              {filteredOrders.length} records
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Operational orders joined with customer entities, line-item valuations, and gateway settlements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
          <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
            {['ALL', 'DELIVERED', 'SHIPPED', 'PAID', 'PENDING'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-md font-medium text-[11px] transition ${
                  statusFilter === st
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st}
              </button>
            ))}
          </div>

          <button
            onClick={onRefresh}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300 border-collapse">
            <thead className="bg-zinc-950/70 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800 font-mono">
              <tr>
                <th className="px-4 py-3 font-medium">Order Ref</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Destination</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Fulfillment</th>
                <th className="px-4 py-3 font-medium text-center">Settlement</th>
                <th className="px-4 py-3 font-medium text-right">Items</th>
                <th className="px-4 py-3 font-medium text-right">Total (INR)</th>
                <th className="px-4 py-3 font-medium text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-zinc-500 text-xs">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const initials = o.customer_name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase();
                  const isSuccess = o.payment_status === 'SUCCESS';

                  return (
                    <tr
                      key={o.order_id}
                      onClick={() => openOrderDrawer(o)}
                      className="hover:bg-zinc-800/40 transition cursor-pointer group"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-zinc-200">
                        #ORD-100{o.order_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60 text-[10px] font-semibold flex items-center justify-center font-mono shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium text-zinc-200 group-hover:text-white transition">
                            {o.customer_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">
                        {o.city}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">
                        {o.order_date}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getFulfillmentBadge(o.order_status)}`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${
                          isSuccess
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                          {o.payment_status} ({o.payment_method})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-zinc-400 font-mono">
                        {o.item_count} SKU{o.item_count > 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-zinc-100">
                        ₹{Number(o.order_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="px-2 py-1 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium inline-flex items-center gap-1 transition">
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Invoice / Order Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="w-full max-w-xl bg-zinc-900 border-l border-zinc-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-zinc-100 font-mono">Order #ORD-100{selectedOrder.order_id}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getFulfillmentBadge(selectedOrder.order_status)}`}>
                      {selectedOrder.order_status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Placed on {selectedOrder.order_date} • Cluster Database Transaction</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Customer & Settlement Metadata */}
              <div className="grid grid-cols-2 gap-4 my-5 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Customer</span>
                  <div className="font-medium text-zinc-200 mt-1">{selectedOrder.customer_name}</div>
                  <div className="text-zinc-400 mt-0.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-zinc-500" /> {selectedOrder.city}, India
                  </div>
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-mono">Payment Record</span>
                  <div className="font-medium text-zinc-200 mt-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedOrder.payment_method}
                  </div>
                  <div className="mt-0.5">
                    <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-semibold ${
                      selectedOrder.payment_status === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      ● {selectedOrder.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-zinc-400 font-mono mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Ordered Items ({orderItems.length})
                </h4>
                {loadingItems ? (
                  <div className="py-6 text-center text-xs text-zinc-500 font-mono">Retrieving order_items rows...</div>
                ) : (
                  <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950/40">
                    <table className="w-full text-left text-xs text-zinc-300">
                      <thead className="bg-zinc-950 text-[10px] uppercase tracking-wider text-zinc-500 border-b border-zinc-800 font-mono">
                        <tr>
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2 text-center">Qty</th>
                          <th className="px-3 py-2 text-right">Unit Price</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-sans">
                        {orderItems.map((item) => (
                          <tr key={item.order_item_id}>
                            <td className="px-3 py-2.5">
                              <div className="font-medium text-zinc-200">{item.product_name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">SKU #{item.product_id} • {item.category}</div>
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono font-medium text-zinc-200">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-right font-mono text-zinc-400">
                              ₹{Number(item.unit_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-semibold text-zinc-100">
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

            {/* Financial Summary Footer */}
            <div className="pt-4 border-t border-zinc-800 mt-6 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal:</span>
                <span className="font-mono text-zinc-200">
                  ₹{Number(selectedOrder.order_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Taxes & Duties (GST):</span>
                <span className="font-mono text-zinc-200">Included (18%)</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-zinc-100 pt-2 border-t border-zinc-800 font-mono">
                <span>Grand Total:</span>
                <span className="text-emerald-400">
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
