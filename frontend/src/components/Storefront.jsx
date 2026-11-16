import React, { useState } from 'react';
import { 
  Laptop, 
  Mouse, 
  Keyboard, 
  Tv, 
  Headphones, 
  Camera, 
  ShoppingCart, 
  Check, 
  Star, 
  ShieldCheck, 
  Truck, 
  Sparkles,
  Search,
  SlidersHorizontal,
  PackageCheck
} from 'lucide-react';

const PRODUCT_ICONS = {
  1: Laptop,
  2: Mouse,
  3: Keyboard,
  4: Tv,
  5: Headphones,
  6: Camera
};

const PRODUCT_DETAILS = {
  1: {
    tagline: 'High-performance engineering workstation',
    specs: ['16GB Unified RAM', '512GB PCIe Gen4 SSD', '14.2" Liquid Retina'],
    rating: 4.9,
    reviews: 142
  },
  2: {
    tagline: 'Ergonomic dual-mode wireless optical mouse',
    specs: ['2.4GHz + Bluetooth', '4000 DPI Sensor', 'Silent Tactile Clicks'],
    rating: 4.8,
    reviews: 389
  },
  3: {
    tagline: 'Hot-swappable RGB tactile mechanical keyboard',
    specs: ['Gateron Brown Switches', 'PBT Double-Shot Caps', 'Type-C Detachable'],
    rating: 4.9,
    reviews: 215
  },
  4: {
    tagline: '27-inch 4K IPS Ultra HD developer monitor',
    specs: ['3840 x 2160 UHD', '144Hz Refresh Rate', '90W USB-C Power Delivery'],
    rating: 4.7,
    reviews: 98
  },
  5: {
    tagline: 'Active noise-cancelling studio headphones',
    specs: ['Hybrid ANC System', '40mm Neodymium Drivers', '40-Hour Battery Life'],
    rating: 4.8,
    reviews: 174
  },
  6: {
    tagline: 'Full HD 1080p 60fps streaming & conferencing webcam',
    specs: ['Dual Stereo Mics', 'Hardware Privacy Shutter', 'Autofocus Glass Lens'],
    rating: 4.6,
    reviews: 120
  }
};

export default function Storefront({ products, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [addedNotice, setAddedNotice] = useState(null);

  const categories = ['ALL', 'Electronics', 'Accessories'];

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch = !searchTerm || p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleAdd = (product) => {
    onAddToCart(product);
    setAddedNotice(product.product_name);
    setTimeout(() => setAddedNotice(null), 2500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Real E-Commerce Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-sm transition-colors">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Hardware & Developer Gear
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Engineered for High-Velocity Teams.
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Premium developer workstations, ergonomic peripherals, studio audio, and 4K Ultra HD displays curated for engineering excellence.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Free Express Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> 1-Year Hardware Warranty
            </span>
            <span className="flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Verified On-Hand Stock
            </span>
          </div>
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>Added <strong>{addedNotice}</strong> to cart!</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {cat === 'ALL' ? 'All Hardware' : cat}
            </button>
          ))}
        </div>

        {/* Catalog Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search catalog products..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
          />
        </div>

      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((p) => {
          const Icon = PRODUCT_ICONS[p.product_id] || Laptop;
          const meta = PRODUCT_DETAILS[p.product_id] || {
            tagline: 'Commercial premium equipment',
            specs: ['Industry Standard', 'Verified Quality'],
            rating: 4.8,
            reviews: 50
          };
          const isLowStock = p.stock_quantity < 5 && p.stock_quantity > 0;
          const isOutOfStock = p.stock_quantity <= 0;

          return (
            <div
              key={p.product_id}
              className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition shadow-xs group"
            >
              <div>
                {/* Visual Header / Icon Badge */}
                <div className="h-40 rounded-xl bg-zinc-100 dark:bg-zinc-950 flex flex-col items-center justify-center relative p-4 mb-4 border border-zinc-200/80 dark:border-zinc-850">
                  <Icon className="w-16 h-16 text-zinc-700 dark:text-zinc-300 group-hover:scale-105 transition-transform duration-200" />
                  
                  {/* Stock Tag */}
                  <div className="absolute top-3 right-3">
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                        Out of Stock
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                        Only {p.stock_quantity} left
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {p.stock_quantity} in stock
                      </span>
                    )}
                  </div>

                  {/* Category Pill */}
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-white/80 dark:bg-zinc-900/80 px-2 py-0.5 rounded">
                    {p.category}
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 text-xs mb-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">{meta.rating}</span>
                  <span className="text-zinc-400 text-[11px]">({meta.reviews})</span>
                </div>

                {/* Title & Description */}
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
                  {p.product_name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  {meta.tagline}
                </p>

                {/* Key Bullet Specs */}
                <div className="mt-3 space-y-1">
                  {meta.specs.map((spec, i) => (
                    <div key={i} className="text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 font-mono">
                      <span className="w-1 h-1 rounded-full bg-indigo-500"></span>
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing & Add to Cart Footer */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase font-mono text-zinc-400">Price (incl. GST)</span>
                  <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                    ₹{Number(p.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <button
                  onClick={() => handleAdd(p)}
                  disabled={isOutOfStock}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 transition active:scale-95"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
