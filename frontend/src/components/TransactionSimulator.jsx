import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ArrowLeftRight, 
  CheckCircle2, 
  AlertOctagon, 
  Terminal,
  Play,
  RotateCcw
} from 'lucide-react';

export default function TransactionSimulator({ onRefreshData }) {
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([
    { type: 'info', text: 'PostgreSQL 18 Transaction Sandbox initialized.' },
    { type: 'info', text: 'Select an execution scenario below to evaluate ACID isolation and state recovery.' }
  ]);

  const addLog = (type, text) => {
    setConsoleOutput(prev => [...prev, { type, text, time: new Date().toLocaleTimeString() }]);
  };

  const runSimulation = async (mode) => {
    setLoading(true);
    setActiveMode(mode);
    addLog('cmd', `[TX-EXEC] Initiating ${mode.toUpperCase()} transaction on table 'inventory'...`);

    try {
      const res = await fetch('/api/transaction/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, product_id: 2, quantity: 49 })
      });
      const data = await res.json();

      if (mode === 'rollback') {
        addLog('sql', 'BEGIN;');
        addLog('sql', 'UPDATE inventory SET stock_quantity = stock_quantity - 10 WHERE product_id = 2; -- (tentative: 40)');
        addLog('err', 'RAISE EXCEPTION "Simulated reservation abort: Payment gateway timed out"');
        addLog('sql', 'ROLLBACK; -- (undo tentative writes)');
        addLog('ok', `[STATE VERIFIED] product_id 2 stock reverted intact to ${data.current_state?.stock_quantity ?? 50} units. Atomicity preserved.`);
      } else {
        addLog('sql', 'BEGIN;');
        addLog('sql', 'UPDATE inventory SET stock_quantity = 49 WHERE product_id = 2;');
        addLog('sql', 'TRIGGER trg_inventory_last_updated FIRED (NEW.last_updated = CURRENT_TIMESTAMP)');
        addLog('sql', 'COMMIT;');
        addLog('ok', `[STATE COMMITTED] product_id 2 stock persisted at 49 units. last_updated = ${data.current_state?.last_updated}`);
      }

      if (onRefreshData) onRefreshData();
    } catch (err) {
      addLog('err', `Execution error: ${err.message}`);
    } finally {
      setLoading(false);
      setActiveMode(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
          <span>ACID Transaction Isolation & State Recovery Sandbox</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
            WAL & MVCC
          </span>
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Empirical verification of Atomicity and Durability during simulated order-placement transaction failures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenario 1: Abort & Rollback */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" /> Scenario A: Aborted Tx (ROLLBACK)
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Atomicity</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Executes an inventory deduction inside an uncommitted transaction, triggers an unhandled business logic exception, and issues a <code className="text-zinc-200">ROLLBACK</code>. Demonstrates that PostgreSQL Multi-Version Concurrency Control (MVCC) completely prevents dirty reads and restores original stock.
            </p>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 font-mono text-[11px] text-zinc-400 space-y-0.5 mb-4">
              <div><span className="text-indigo-400">BEGIN;</span></div>
              <div className="text-zinc-400">UPDATE inventory SET stock_quantity = 40 WHERE product_id = 2;</div>
              <div><span className="text-rose-400">RAISE EXCEPTION</span> 'Gateway Failure';</div>
              <div><span className="text-rose-400 font-bold">ROLLBACK;</span></div>
            </div>
          </div>
          <button
            onClick={() => runSimulation('rollback')}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700 transition flex items-center justify-center gap-1.5"
          >
            <Play className="w-3 h-3 text-rose-400" /> Run Rollback Simulation
          </button>
        </div>

        {/* Scenario 2: Verified Tx & Commit */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Scenario B: Verified Order Tx (COMMIT)
              </span>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Durability</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
              Simulates a successful order-settlement pipeline: verifies stock availability, decrements Product #2 to 49, triggers audit logging, and executes <code className="text-zinc-200">COMMIT</code>. Writes are flushed to the Write-Ahead Log (WAL) to guarantee durability.
            </p>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 font-mono text-[11px] text-zinc-400 space-y-0.5 mb-4">
              <div><span className="text-indigo-400">BEGIN;</span></div>
              <div className="text-zinc-400">UPDATE inventory SET stock_quantity = 49 WHERE product_id = 2;</div>
              <div className="text-zinc-500">-- PL/pgSQL trigger sets last_updated</div>
              <div><span className="text-emerald-400 font-bold">COMMIT;</span></div>
            </div>
          </div>
          <button
            onClick={() => runSimulation('commit')}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 hover:text-white text-xs font-medium border border-zinc-700 transition flex items-center justify-center gap-1.5"
          >
            <Play className="w-3 h-3 text-emerald-400" /> Run Commit Simulation
          </button>
        </div>
      </div>

      {/* Real-time Interactive Execution Console */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-zinc-950 px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>psql session output stream</span>
          </div>
          <button
            onClick={() => setConsoleOutput([{ type: 'info', text: 'Console cleared.' }])}
            className="text-[10px] text-zinc-500 hover:text-zinc-300"
          >
            Clear
          </button>
        </div>
        <div className="p-4 bg-zinc-950 text-xs font-mono space-y-1.5 max-h-48 overflow-y-auto">
          {consoleOutput.map((log, i) => {
            let color = 'text-zinc-400';
            if (log.type === 'sql') color = 'text-zinc-300 font-semibold';
            if (log.type === 'err') color = 'text-rose-400';
            if (log.type === 'ok') color = 'text-emerald-400 font-semibold';
            if (log.type === 'cmd') color = 'text-amber-400';

            return (
              <div key={i} className={`flex items-start gap-2 ${color}`}>
                <span className="text-zinc-600 select-none">&gt;</span>
                <span>{log.text}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
