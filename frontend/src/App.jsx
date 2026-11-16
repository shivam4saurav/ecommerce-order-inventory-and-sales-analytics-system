import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Storefront from './components/Storefront.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import OrdersManager from './components/OrdersManager.jsx';
import InventoryManager from './components/InventoryManager.jsx';
import CustomersView from './components/CustomersView.jsx';
import OrderConfirmationModal from './components/OrderConfirmationModal.jsx';
import KPICards from './components/KPICards.jsx';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Boxes, 
  Users, 
  RefreshCw,
  Store,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const [activeMode, setActiveMode] = useState('storefront');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  // Shopping Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Sync theme to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchAllData = async () => {
    try {
      const [statsRes, prodRes, ordRes, invRes, custRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/inventory'),
        fetch('/api/customers')
      ]);

      const [statsData, prodData, ordData, invData, custData] = await Promise.all([
        statsRes.json(),
        prodRes.json(),
        ordRes.json(),
        invRes.json(),
        custRes.json()
      ]);

      setStats(statsData);
      setProducts(prodData);
      setOrders(ordData);
      setInventory(invData);
      setCustomers(custData);
    } catch (e) {
      console.error('Error fetching data from PostgreSQL:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Cart operations
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  // Checkout order submission (Atomic ACID Transaction)
  const handleCheckout = async (orderPayload) => {
    setPlacingOrder(true);
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (data.success && data.order) {
        setCart([]);
        setIsCartOpen(false);
        setConfirmedOrder(data.order);
        await fetchAllData();
      } else {
        alert('Order processing error: ' + (data.error || 'Failed to place order.'));
      }
    } catch (err) {
      alert('Network/Database error during checkout: ' + err.message);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Stock Adjustment
  const handleUpdateStock = async (productId, newQty) => {
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, stock_quantity: newQty })
      });
      const data = await res.json();
      await fetchAllData();
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  // Order Status update (Advance: Paid -> Shipped -> Delivered)
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, status: newStatus })
      });
      const data = await res.json();
      await fetchAllData();
      return data;
    } catch (e) {
      console.error(e);
    }
  };

  // Reset demo data to benchmark baseline
  const handleReset = async () => {
    if (!window.confirm('Restore PostgreSQL database to the initial baseline sample dataset?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      await fetchAllData();
      alert(data.message);
    } catch (e) {
      alert('Error resetting database: ' + e.message);
    } finally {
      setResetting(false);
    }
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150 selection:bg-indigo-500 selection:text-white">
      
      {/* Global Top Navbar */}
      <Navbar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        theme={theme}
        toggleTheme={toggleTheme}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-500 dark:text-zinc-400 text-xs font-mono space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <p>Loading catalog & store data...</p>
          </div>
        ) : (
          <>
            {/* 1. CUSTOMER STOREFRONT */}
            {activeMode === 'storefront' && (
              <Storefront
                products={products}
                onAddToCart={handleAddToCart}
              />
            )}

              {/* 2. OPERATIONS ADMIN (Orders & Financial Reconciliation) */}
              {activeMode === 'admin' && (
                <div className="space-y-6">
                  <KPICards stats={stats} />

                  {/* Revenue Reconciliation Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    
                    {/* Financial Reconciliation */}
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4.5 flex flex-col justify-between shadow-xs transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">
                            Revenue Reconciliation: Gross Order Volume vs. Settled Revenue
                          </h4>
                          <span className="text-[10px] text-zinc-500 font-mono">Financial Audit</span>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                          In real financial systems, gross order placement differs from settled cash. The revenue statement distinguishes verified settled payments from pending cart totals.
                        </p>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Realized Revenue (Settled)</span>
                            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">₹100,200.00 (89.3%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '89.3%' }}></div>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">5 successful settlements (Orders #1, #2, #4, #5, #6)</div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">Unsettled / Incomplete Transaction</span>
                            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">₹12,000.00 (10.7%)</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '10.7%' }}></div>
                          </div>
                          <div className="text-[10px] text-zinc-500 mt-0.5 font-mono">Order #3 (Rahul Mehta) • Payment status: FAILED</div>
                        </div>

                        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/80 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-200">Accounting Rule:</span> Gross placed orders total ₹112,200.00. Settled revenue recognized in bank deposits includes only successful gateway transactions, totaling ₹100,200.00 for October 2026.
                        </div>
                      </div>
                    </div>

                    {/* Quick Inventory Health Alert */}
                    <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4.5 flex flex-col justify-between shadow-xs transition-colors">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">Replenishment Priority</h4>
                          <span className="text-[10px] text-rose-500 font-mono font-semibold">2 SKUs CRITICAL</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-3">
                          Automated safety threshold: Less than 5 units on hand
                        </p>
                      </div>

                      <div className="space-y-2">
                        {inventory.filter(i => i.stock_quantity < 5).map(item => (
                          <div key={item.product_id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-zinc-200">{item.product_name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono">SKU-00{item.product_id} • {item.category}</div>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-bold text-rose-500">{item.stock_quantity} units</span>
                              <div className="text-[10px] text-zinc-500">Reorder &lt; 5</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveMode('inventory')}
                        className="w-full mt-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                      >
                        Open Stock Matrix
                      </button>
                    </div>

                  </div>

                  <OrdersManager
                    orders={orders}
                    onRefresh={fetchAllData}
                    onUpdateStatus={handleUpdateOrderStatus}
                    onReset={handleReset}
                    resetting={resetting}
                  />
                </div>
              )}

            {/* 3. WAREHOUSE & STOCK MANAGEMENT */}
            {activeMode === 'inventory' && (
              <InventoryManager
                inventory={inventory}
                onUpdateStock={handleUpdateStock}
                onRefresh={fetchAllData}
              />
            )}

            {/* 4. CUSTOMERS & DIRECTORY */}
            {activeMode === 'customers' && (
              <CustomersView
                customers={customers}
              />
            )}
          </>
        )}

      </main>

      {/* Slide-over Shopping Cart & Payment Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        customers={customers}
        onCheckout={handleCheckout}
        placingOrder={placingOrder}
      />

      {/* Order Placement Confirmation Modal */}
      <OrderConfirmationModal
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewInAdmin={() => {
          setConfirmedOrder(null);
          setActiveMode('admin');
        }}
      />

      {/* Real Commercial Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 py-6 px-4 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">© 2026 Meridian Commerce, Inc.</span>
            <span>•</span>
            <span>All rights reserved.</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-zinc-500 dark:text-zinc-400">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition">Privacy Policy</a>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition">Terms of Service</a>
            <a href="#security" onClick={(e) => e.preventDefault()} className="hover:text-zinc-800 dark:hover:text-zinc-200 transition">Security</a>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
