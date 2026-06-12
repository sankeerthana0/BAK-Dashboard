/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Network, 
  SlidersHorizontal, 
  Info, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { ALL_TRANSACTIONS, ALL_BRANCHES } from './DBData';

interface BranchCorrelationProps {
  onAddLog: (message: string) => void;
}

export default function BranchCorrelation({ onAddLog }: BranchCorrelationProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('B04'); // default B04 East Metro
  const [lagDays, setLagDays] = useState<number>(2); // Shift comparison node by X days

  // Standard timeline compilation
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(ALL_TRANSACTIONS.map(t => t.orderDate))).sort();
  }, []);

  // Compute daily totals for HQ North Hub (B01)
  const hqDailySales = useMemo(() => {
    const dailyTotals: Record<string, number> = {};
    uniqueDates.forEach(d => { dailyTotals[d] = 0; });
    
    ALL_TRANSACTIONS
      .filter(t => t.branchId === 'B01') // B01 is HQ North Hub
      .forEach(t => {
        dailyTotals[t.orderDate] += t.amount;
      });
      
    return dailyTotals;
  }, [uniqueDates]);

  // Compute daily totals for the selected branch (uncorrected for lag first)
  const branchDailySales = useMemo(() => {
    const dailyTotals: Record<string, number> = {};
    uniqueDates.forEach(d => { dailyTotals[d] = 0; });
    
    ALL_TRANSACTIONS
      .filter(t => t.branchId === selectedBranchId)
      .forEach(t => {
        dailyTotals[t.orderDate] += t.amount;
      });
      
    return dailyTotals;
  }, [selectedBranchId, uniqueDates]);

  const targetBranchName = useMemo(() => {
    return ALL_BRANCHES.find(b => b.branchId === selectedBranchId)?.branchName || 'Selected Branch';
  }, [selectedBranchId]);

  // Generate shifted & paired timeline dataset for chart and statistical calculations
  const chartData = useMemo(() => {
    return uniqueDates.map((dateStr, idx) => {
      // Find shifted idx according to chosen lagDays
      // E.g., shiftedIdx = idx - lagDays
      const shiftedIdx = idx - lagDays;
      let branchValue = 0;
      
      if (shiftedIdx >= 0 && shiftedIdx < uniqueDates.length) {
        const shiftedDateStr = uniqueDates[shiftedIdx];
        branchValue = branchDailySales[shiftedDateStr] || 0;
      } else {
        // Fallback boundary padding
        branchValue = branchDailySales[dateStr] || 0;
      }

      return {
        date: dateStr.substring(5), // truncate '2026-' prefix
        hqSales: hqDailySales[dateStr] || 0,
        branchSalesShifted: branchValue
      };
    });
  }, [uniqueDates, hqDailySales, branchDailySales, lagDays]);

  // Calculate live statistical correlation coefficient (Pearson r) between HQ and Shifted Branch sales
  const correlationResult = useMemo(() => {
    const hqArr: number[] = [];
    const bArr: number[] = [];

    // Filter out edge boundaries where shifted results might be padded zeros
    chartData.slice(4, -4).forEach(item => {
      hqArr.push(item.hqSales);
      bArr.push(item.branchSalesShifted);
    });

    const n = hqArr.length;
    if (n === 0) return 0;

    const sumH = hqArr.reduce((a, b) => a + b, 0);
    const sumB = bArr.reduce((a, b) => a + b, 0);
    
    const sumHSq = hqArr.reduce((sum, v) => sum + (v * v), 0);
    const sumBSq = bArr.reduce((sum, v) => sum + (v * v), 0);
    
    let sumHB = 0;
    for (let i = 0; i < n; i++) {
      sumHB += hqArr[i] * bArr[i];
    }

    const numerator = (n * sumHB) - (sumH * sumB);
    const denominator = Math.sqrt(((n * sumHSq) - (sumH * sumH)) * ((n * sumBSq) - (sumB * sumB)));

    if (denominator === 0) return 0;
    return parseFloat((numerator / denominator).toFixed(3));
  }, [chartData]);

  // Dynamic advice generator based on selected branch and active correlation strength
  const connectionDescription = useMemo(() => {
    const coefficient = correlationResult;
    let rank = 'Weak relationship';
    let detail = 'Minimal day-by-day influence. Sales cycles in this branch appear localized.';

    if (Math.abs(coefficient) >= 0.7) {
      rank = 'Strong direct relationship';
      detail = 'Highly synchronous inventory dependencies. Significant procurement constraints at North HQ will propagate directly onto branch floor operations.';
    } else if (Math.abs(coefficient) >= 0.45) {
      rank = 'Moderate relationship';
      detail = 'Notable logistical relationship. Warehouse stock levels show aligned operational trendlines.';
    }

    return { rank, detail };
  }, [correlationResult]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="correlation-analyzer">
      {/* Simulation Controls Dashboard panel */}
      <div className="lg:col-span-4 flex flex-col gap-6" id="correlation-controls-panel">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="correlation-hud-interior">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-3" id="corr-title-block">
            <Network className="text-indigo-400 w-5 h-5 animate-pulse" id="network-flow-icon" />
            <span className="text-sm font-bold text-slate-300 font-sans uppercase tracking-wider">LOGISTICAL COUPLING ANALYZER</span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Identify cascading supply-chain anomalies by testing lag-correlations between <strong className="text-slate-200">HQ North Hub</strong> and physical branch warehouses.
          </p>

          <div className="space-y-4" id="coupling-controls-fields">
            {/* Branch dropdown selector */}
            <div className="flex flex-col gap-1.5" id="corr-branch-group">
              <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight">Active Target Outlet:</label>
              <select 
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  onAddLog(`Logistical mapping target changed to branch ID: ${e.target.value}`);
                }}
                className="bg-slate-950 text-slate-300 text-xs rounded border border-slate-850 py-2 px-3 focus:outline-none focus:border-indigo-550 hover:border-slate-800 cursor-pointer"
                id="corr-branch-dropdown"
              >
                {ALL_BRANCHES.filter(b => b.branchId !== 'B01').map(b => (
                  <option key={b.branchId} value={b.branchId}>{b.branchName} ({b.region} Region)</option>
                ))}
              </select>
            </div>

            {/* Slider setting lead/lag offset */}
            <div className="flex flex-col gap-2 mt-2" id="lag-slider-group">
              <div className="flex justify-between items-center" id="lag-labels">
                <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" /> Logistical Lag Offset:
                </label>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20" id="lag-days-indicator">
                  {lagDays === 0 ? 'Synchronous (0d)' : lagDays > 0 ? `+${lagDays} Days Lag` : `${lagDays} Days Lead`}
                </span>
              </div>
              <input 
                type="range" 
                min="-3" 
                max="3" 
                value={lagDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setLagDays(val);
                  onAddLog(`Adjusted logistical correlation lag to: ${val} days`);
                }}
                className="w-full accent-indigo-505 bg-slate-950 rounded-lg appearance-none h-1.5 border border-slate-850 cursor-pointer"
                id="lag-days-slider"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold" id="slider-limits">
                <span>-3d (Lead)</span>
                <span>0d</span>
                <span>+3d (Lag)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistical Correlation Output box */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm text-center flex flex-col justify-center items-center" id="stat-r-value-display">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block">Pearson Correlation Coefficient (r)</span>
          <div className="text-3xl font-extrabold text-slate-100 font-mono my-2.5 flex items-center gap-2" id="math-r-visual">
            {correlationResult > 0 ? '+' : ''}{correlationResult}
          </div>
          <span className={`inline-flex items-center gap-1 text-[11px] font-sans font-bold px-3 py-1 rounded bg-slate-950 border uppercase ${
            correlationResult >= 0.7 
              ? 'text-emerald-400 border-emerald-400/20 bg-emerald-500/10' 
              : correlationResult >= 0.45 
                ? 'text-indigo-400 border-indigo-500/20 bg-indigo-505/10' 
                : 'text-slate-400 border-slate-800 bg-slate-950'
          }`} id="corr-rank-badge">
            <Activity className="w-3.5 h-3.5" /> {connectionDescription.rank}
          </span>
          <p className="text-xs text-slate-400 font-sans mt-3 px-1 leading-relaxed text-left" id="corr-explanation-descr">
            {connectionDescription.detail}
          </p>
        </div>
      </div>

      {/* Main Dual Axis Visual chart workspace */}
      <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="correlation-timeline-panel">
        <div className="flex items-start justify-between mb-4" id="corr-timeline-header">
          <div>
            <h3 className="text-base font-semibold text-slate-200 font-sans">HQ North Hub vs. {targetBranchName} Daily Revenue</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">DUAL-AXIS SCATTER LAG CORREC-TION VIEW</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono" id="corr-chart-legend">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> HQ Sales (Base)
            </span>
            <span className="flex items-center gap-1.5 text-slate-450 font-semibold text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Branch Sales (Offset)
            </span>
          </div>
        </div>

        {/* Dynamic Recharts dual line chart */}
        <div className="h-[280px]" id="corr-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                fontSize={10} 
                fontFamily="JetBrains Mono" 
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#6366f1" 
                fontSize={10} 
                fontFamily="JetBrains Mono" 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10b981" 
                fontSize={10} 
                fontFamily="JetBrains Mono" 
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8', fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 'bold' }}
                itemStyle={{ fontSize: '12px' }}
                formatter={(value: any, name: string) => {
                  const label = name === 'hqSales' ? 'HQ Revenue' : 'Branch Revenue Shifted';
                  return [`$${parseInt(value).toLocaleString()}`, label];
                }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="hqSales" 
                stroke="#6366f1" 
                strokeWidth={2.5}
                dot={false}
                name="hqSales"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="branchSalesShifted" 
                stroke="#10b981" 
                strokeWidth={1.8}
                dot={false}
                name="branchSalesShifted"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tactical Discovery & Business case study note */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 mt-4" id="discovery-case-study">
          <div className="flex items-start gap-3" id="corr-summary-group">
            <Lightbulb className="w-6 h-6 text-yellow-400 mt-0.5 flex-none" id="lightbulb-icon" />
            <div className="font-sans text-xs text-slate-400 leading-relaxed" id="corr-summary-text">
              <span className="font-bold text-slate-300 block mb-1">Logistical Discovery: The Procurement Bottleneck</span>
              Adjusting the lag settings of <strong className="text-slate-200">East Metro Depot (B04)</strong> to exactly <strong className="text-slate-200">+2 Days</strong> reveals a maximum correlation peak of <strong className="text-slate-100">+0.81</strong>. This indicates inventory stockout effects at the Central procurement terminal require exactly 48 hours to cascade out and deplete physical sales at surrounding branches. Analytical alignment allows our operations to pre-emptively shift supplies ahead of branch depletions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
