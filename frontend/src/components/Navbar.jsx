import React from 'react';
import { 
  ShoppingBag, 
  LayoutDashboard, 
  Boxes, 
  Users, 
  Sun, 
  Moon, 
  ShoppingCart, 
  Database,
  Store
} from 'lucide-react';

export default function Navbar({ 
  activeMode, 
  setActiveMode, 
  theme, 
  toggleTheme, 
  cartCount, 
  onOpenCart, 
  onReset, 
  resetting 
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-bold shadow-sm">
            <Store className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Meridian Commerce
              </span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                Store & Admin
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Hardware & Developer Equipment
            </p>
          </div>
        </div>

        {/* Central Mode Switcher: Storefront vs Admin */}
        <div className="hidden sm:flex items-center bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
          <button
            onClick={() => setActiveMode('storefront')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              activeMode === 'storefront'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
            Storefront
          </button>

          <button
            onClick={() => setActiveMode('admin')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              activeMode === 'admin'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-emerald-500" />
            Operations Admin
          </button>

          <button
            onClick={() => setActiveMode('inventory')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              activeMode === 'inventory'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-amber-500" />
            Stock & Inventory
          </button>

          <button
            onClick={() => setActiveMode('customers')}
            className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition ${
              activeMode === 'customers'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-500" />
            Customers
          </button>
        </div>

        {/* Right Tools: Cart, Theme Toggle */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Shopping Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-200 text-xs font-semibold border border-zinc-200 dark:border-zinc-700/80 flex items-center gap-2 transition shadow-xs"
          >
            <ShoppingCart className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/80 transition"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

        </div>

      </div>

      {/* Mobile Mode Switcher Bar */}
      <div className="flex sm:hidden overflow-x-auto px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 gap-1 text-xs">
        {[
          { id: 'storefront', label: 'Shop', icon: ShoppingBag },
          { id: 'admin', label: 'Orders', icon: LayoutDashboard },
          { id: 'inventory', label: 'Inventory', icon: Boxes },
          { id: 'customers', label: 'Customers', icon: Users },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeMode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveMode(item.id)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
                isActive
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <Icon className="w-3 h-3" /> {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
