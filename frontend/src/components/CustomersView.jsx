import React, { useState } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  ShoppingBag, 
  CreditCard,
  Search
} from 'lucide-react';

export default function CustomersView({ customers }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = customers.filter(c => 
    !searchTerm ||
    c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            <span>Customer Directory & Lifetime Value</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono">
              {filtered.length} customers
            </span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Registered customer entities, regional distribution, and aggregated purchase value.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search customers or city..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 rounded-lg pl-9 pr-3 py-1.5 focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300 border-collapse">
            <thead className="bg-zinc-50 dark:bg-zinc-950/80 text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 font-mono">
              <tr>
                <th className="px-4 py-3 font-medium">Customer ID</th>
                <th className="px-4 py-3 font-medium">Full Name</th>
                <th className="px-4 py-3 font-medium">Contact Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">City / State</th>
                <th className="px-4 py-3 font-medium text-center">Orders Placed</th>
                <th className="px-4 py-3 font-medium text-right">Lifetime Spend (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
              {filtered.map((c) => {
                const initials = c.customer_name
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase() || 'CU';

                return (
                  <tr key={c.customer_id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition">
                    <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      #CUST-00{c.customer_id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                          {initials}
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {c.customer_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400 font-mono">
                      {c.phone}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-zinc-400" />
                        {c.city}, India
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {c.total_orders} orders
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(c.total_spent).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
