/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Building, 
  Target, 
  Percent,
  HelpCircle,
  Filter,
  CheckCircle,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { ALL_TRANSACTIONS, ALL_BRANCHES, ALL_OPERATING_COSTS } from './DBData';
import { KPIMetric } from '../types';

interface DashboardViewProps {
  onAddLog: (message: string) => void;
  onNavigateToSQL: (queryId: string) => void;
}

export default function DashboardView({ onAddLog, onNavigateToSQL }: DashboardViewProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [selectedBranch, setSelectedBranch] = useState<string>('All');
  const [timeframe, setTimeframe] = useState<string>('60d'); // '7d' | '30d' | '60d'
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Filter branches based on region selection
  const filteredBranches = useMemo(() => {
    if (selectedRegion === 'All') return ALL_BRANCHES;
    return ALL_BRANCHES.filter(b => b.region === selectedRegion);
  }, [selectedRegion]);

  // Adjust branch dropdown when region changes
  const activeBranchId = useMemo(() => {
    if (selectedBranch === 'All') return 'All';
    const exists = filteredBranches.some(b => b.branchId === selectedBranch);
    return exists ? selectedBranch : 'All';
  }, [selectedBranch, filteredBranches]);

  // Calculate filtered date threshold
  const dateThreshold = useMemo(() => {
    const target = new Date('2026-06-12');
    if (timeframe === '7d') target.setDate(target.getDate() - 7);
    else if (timeframe === '30d') target.setDate(target.getDate() - 30);
    else target.setDate(target.getDate() - 60);
    return target.toISOString().split('T')[0];
  }, [timeframe]);

  // Apply filters on transactions
  const filteredTransactions = useMemo(() => {
    return ALL_TRANSACTIONS.filter(t => {
      // Date filter
      if (t.orderDate < dateThreshold) return false;
      
      // Branch filter
      if (activeBranchId !== 'All') {
        return t.branchId === activeBranchId;
      }
      
      // Region filter
      if (selectedRegion !== 'All') {
        const branchObj = ALL_BRANCHES.find(b => b.branchId === t.branchId);
        return branchObj && branchObj.region === selectedRegion;
      }
      
      return true;
    });
  }, [dateThreshold, activeBranchId, selectedRegion]);

  // Apply filters on operating costs
  const filteredExpenses = useMemo(() => {
    return ALL_OPERATING_COSTS.filter(c => {
      if (c.date < dateThreshold) return false;
      if (activeBranchId !== 'All') return c.branchId === activeBranchId;
      if (selectedRegion !== 'All') {
        const branchObj = ALL_BRANCHES.find(b => b.branchId === c.branchId);
        return branchObj && branchObj.region === selectedRegion;
      }
      return true;
    });
  }, [dateThreshold, activeBranchId, selectedRegion]);

  // Key stats aggregation
  const totals = useMemo(() => {
    const grossSales = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const txCount = filteredTransactions.length;
    const avgBasket = txCount > 0 ? Math.round(grossSales / txCount) : 0;
    
    // Operating expenses summation
    const totalCosts = filteredExpenses.reduce((sum, c) => sum + c.staffCost + c.rentCost + c.otherCost, 0);
    const netProfit = grossSales - totalCosts;
    const operatingMargin = grossSales > 0 ? parseFloat(((netProfit / grossSales) * 100).toFixed(1)) : 0;

    // Fixed mock metrics for pre-defined timeline performance ratios
    const priorSales = grossSales * 0.92; // +8.0% simulated baseline
    const salesChange = 8.7;
    const priorMargin = operatingMargin - 1.2;
    const marginChange = 4.3;

    return {
      revenue: grossSales,
      revenueChange: salesChange,
      volume: txCount,
      volumeChange: 11.2,
      costs: totalCosts,
      avgBasket,
      netProfit,
      operatingMargin,
      marginChange
    };
  }, [filteredTransactions, filteredExpenses]);

  // Metrics details configuration object
  const kpiMetricsList = useMemo<KPIMetric[]>(() => [
    {
      id: 'm_rev',
      name: 'Gross Operating Revenue',
      value: `$${totals.revenue.toLocaleString()}`,
      change: totals.revenueChange,
      timeframe: `vs. Prior ${timeframe === '7d' ? '7' : timeframe === '30d' ? '30' : '60'} Days`,
      status: totals.revenue > 10000 ? 'optimal' : 'warning',
      details: 'Evaluates revenue contribution derived from active software contracts, hardware shipments, and regional consultation streams.'
    },
    {
      id: 'm_margin',
      name: 'Operating Expense Ratio',
      value: `${totals.operatingMargin}%`,
      change: totals.marginChange,
      timeframe: 'vs. Standard Target (25%)',
      status: totals.operatingMargin >= 22 ? 'optimal' : totals.operatingMargin >= 12 ? 'warning' : 'critical',
      details: 'Net revenue remaining after offsetting complete facility rents, staff labor pools, and regional overhead investments.'
    },
    {
      id: 'm_basket',
      name: 'Average Basket Value',
      value: `$${totals.avgBasket}`,
      change: 3.5,
      timeframe: 'vs. Operational Target ($450)',
      status: totals.avgBasket >= 450 ? 'optimal' : 'warning',
      details: 'Reflects gross deal size distributions. HQ represents direct large Enterprise contracts, while branches operate mid-market accounts.'
    },
    {
      id: 'm_net',
      name: 'Corporate EBIT Contribution',
      value: `$${totals.netProfit.toLocaleString()}`,
      change: 5.9,
      timeframe: 'Combined EBITDA Multipliers',
      status: totals.netProfit > 0 ? 'optimal' : 'critical',
      details: 'Net profit before accounting for corporate tax structures. Highlights immediate liquidity across operating hubs.'
    }
  ], [totals, timeframe]);

  // Timeline performance aggregation for primary visual area chart
  const timelineChartData = useMemo(() => {
    // Group daily values
    const days: Record<string, { date: string; Revenue: number; OperatingExpenses: number }> = {};
    
    // Seed blank structures based on matching filtered range
    const orderedDates = Array.from(new Set(ALL_TRANSACTIONS.map(t => t.orderDate)))
      .filter(d => d >= dateThreshold)
      .sort();

    orderedDates.forEach(d => {
      days[d] = { date: d.substring(5), Revenue: 0, OperatingExpenses: 0 };
    });

    filteredTransactions.forEach(t => {
      if (days[t.orderDate]) {
        days[t.orderDate].Revenue += t.amount;
      }
    });

    filteredExpenses.forEach(c => {
      if (days[c.date]) {
        days[c.date].OperatingExpenses += c.staffCost + c.rentCost + c.otherCost;
      }
    });

    return Object.values(days);
  }, [filteredTransactions, filteredExpenses, dateThreshold]);

  // Category revenue aggregates for bar graph visualization
  const categoryChartData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return Object.entries(categories).map(([name, amount], index) => ({
      name,
      value: amount,
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Branch share metrics
  const branchRevenueData = useMemo(() => {
    const branchRevs: Record<string, { label: string; value: number }> = {};
    
    filteredTransactions.forEach(t => {
      const branchName = ALL_BRANCHES.find(b => b.branchId === t.branchId)?.branchName || t.branchId;
      if (!branchRevs[t.branchId]) {
        branchRevs[t.branchId] = { label: branchName, value: 0 };
      }
      branchRevs[t.branchId].value += t.amount;
    });

    return Object.values(branchRevs).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const handleStatCardClick = (id: string, name: string) => {
    onAddLog(`Inspected KPI detail: '${name}'`);
    // Correlate metrics with original SQL transformations
    if (id === 'm_rev') {
      onNavigateToSQL('q3'); // 7d rolling average / total gross sales SQL
    } else if (id === 'm_margin') {
      onNavigateToSQL('q4'); // Branch profit margin audit SQL
    } else if (id === 'm_basket') {
      onNavigateToSQL('q1'); // Customer spending basket / LTV SQL
    } else {
      onNavigateToSQL('q2'); // Branch ranks SQL
    }
  };

  return (
    <div className="space-y-6" id="dashboard-main">
      {/* Filters HUD */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm" id="dashboard-filters-hud">
        <div className="flex items-center gap-2">
          <Filter className="text-indigo-400 w-5 h-5" id="filt-icon" />
          <h2 className="text-sm font-semibold text-slate-200 tracking-wide font-sans">DASHBOARD FILTERS</h2>
        </div>
        
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3">
          {/* Region selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5" id="region-filt-group">
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 font-bold uppercase">Region:</span>
            <select 
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedBranch('All');
                onAddLog(`Changed active filtering to region: ${e.target.value}`);
              }}
              className="bg-slate-950 text-slate-300 text-xs rounded border border-slate-800 py-1.5 px-3 focus:outline-none focus:border-indigo-500 hover:border-slate-700/80 cursor-pointer"
              id="region-selector"
            >
              <option value="All">All Regions</option>
              <option value="North">North (HQ Region)</option>
              <option value="South">South Region</option>
              <option value="West">West Region</option>
              <option value="East">East Region</option>
              <option value="Central">Central Region</option>
            </select>
          </div>

          {/* Branch selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1.5" id="branch-filt-group">
            <span className="text-[10px] sm:text-xs font-mono text-slate-500 font-bold uppercase">Branch:</span>
            <select 
              value={activeBranchId}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                onAddLog(`Changed active filtering to branch ID: ${e.target.value}`);
              }}
              className="bg-slate-950 text-slate-300 text-xs rounded border border-slate-800 py-1.5 px-3 focus:outline-none focus:border-indigo-500 hover:border-slate-700/80 cursor-pointer disabled:opacity-50"
              disabled={filteredBranches.length === 0}
              id="branch-selector"
            >
              <option value="All">All Outlet Nodes</option>
              {filteredBranches.map(b => (
                <option key={b.branchId} value={b.branchId}>{b.branchName}</option>
              ))}
            </select>
          </div>

          {/* Timeframe picker */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 col-span-2 sm:col-span-1 justify-center" id="timeframe-group">
            {(['7d', '30d', '60d'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  onAddLog(`Adjusted analytical time span filter to: ${tf}`);
                }}
                className={`text-[11px] font-mono font-medium px-3 py-1 rounded transition-colors cursor-pointer ${
                  timeframe === tf 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                id={`tf-btn-${tf}`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Value Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-cards-grid">
        {kpiMetricsList.map(metric => {
          const isOptimal = metric.status === 'optimal';
          const isWarning = metric.status === 'warning';
          const hoverActive = hoveredCard === metric.id;
          
          return (
            <div 
              key={metric.id}
              onClick={() => handleStatCardClick(metric.id, metric.name)}
              onMouseEnter={() => setHoveredCard(metric.id)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`bg-slate-900 border ${
                hoverActive ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-800'
              } p-5 rounded-xl cursor-pointer transition-all duration-300 group shadow-md flex flex-col justify-between h-[155px]`}
              id={`kpi-card-${metric.id}`}
            >
              <div className="flex justify-between items-start" id={`kpi-header-${metric.id}`}>
                <span className="text-xs font-semibold text-slate-400 tracking-tight block font-sans" id={`kpi-name-${metric.id}`}>
                  {metric.name}
                </span>
                <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-mono leading-none ${
                  isOptimal 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : isWarning 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-rose-500/10 text-rose-400'
                }`} id={`kpi-badge-${metric.id}`}>
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  )}
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
              </div>

              <div className="my-2" id={`kpi-body-${metric.id}`}>
                <div className="text-2xl font-bold text-slate-100 font-sans tracking-tight" id={`kpi-val-${metric.id}`}>
                  {metric.value}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1 uppercase" id={`kpi-sub-${metric.id}`}>
                  {metric.timeframe}
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-500 font-medium group-hover:text-indigo-400 transition-colors" id={`kpi-footer-${metric.id}`}>
                <span>Trace back to analytical SQL</span>
                <span className="text-[11px] font-bold">→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-charts-layout">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="revenue-costs-chart-card">
          <div className="flex items-center justify-between mb-4" id="chart-card-header">
            <div>
              <h3 className="text-base font-semibold text-slate-200 font-sans">Revenue vs. Direct Operating Costs</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">SMOOTHED TEMPORAL TREND METRICS</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono" id="chart-legend-labels">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-indigo-505 bg-indigo-500"></span> Gross Revenue
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-3 rounded-full bg-slate-705 bg-slate-700"></span> Operating Costs
              </span>
            </div>
          </div>

          <div className="h-[300px]" id="revenue-timeline-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#475569" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontFamily="JetBrains Mono" 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
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
                  formatter={(value: any) => [`$${parseInt(value).toLocaleString()}`, undefined]}
                />
                <Area 
                  type="monotone" 
                  dataKey="Revenue" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  name="Gross Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="OperatingExpenses" 
                  stroke="#64748b" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1} 
                  fill="url(#colorExp)" 
                  name="Operating Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Share Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="category-share-card">
          <div className="mb-4" id="cat-card-desc">
            <h3 className="text-base font-semibold text-slate-200 font-sans">Revenue by Solution Line</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">PRODUCT PORTFOLIO ALLOCATION</p>
          </div>

          <div className="h-[200px] flex items-center justify-center relative" id="cat-pie-container">
            {categoryChartData.length === 0 ? (
              <span className="text-xs font-mono text-slate-500">No matching data</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', color: '#f1f5f9' }}
                    formatter={(value: any) => [`$${parseInt(value).toLocaleString()}`, undefined]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="absolute text-center" id="pie-center-value">
              <span className="block text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">Total</span>
              <span className="block text-lg font-bold text-slate-200 font-sans">
                ${Math.round(totals.revenue / 1000)}k
              </span>
            </div>
          </div>

          {/* Key Color Legend */}
          <div className="mt-4 space-y-2" id="pie-card-legend">
            {categoryChartData.slice(0, 4).map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-sans" id={`pie-leg-row-${idx}`}>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-xs block" style={{ backgroundColor: entry.color }}></span>
                  <span className="truncate max-w-[140px]">{entry.name}</span>
                </div>
                <span className="font-mono text-slate-300 font-medium">
                  {totals.revenue > 0 ? ((entry.value / totals.revenue) * 100).toFixed(1) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Row: Outlet Breakdown & Deep Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-secondary-row">
        {/* Branch / Node Revenues List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="branch-node-revenues-list">
          <div className="flex items-center justify-between mb-4" id="branches-list-header">
            <div>
              <h3 className="text-base font-semibold text-slate-200 font-sans">Outlet Contribution Breakdown</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">BRANCH PERFORMANCE DISTRIBUTION</p>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
              Active Nodes: {branchRevenueData.length}
            </span>
          </div>

          <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1" id="branches-list-content">
            {branchRevenueData.map((b, idx) => {
              const share =totals.revenue > 0 ? (b.value / totals.revenue) * 100 : 0;
              const isHQ = b.label.includes('HQ');
              return (
                <div key={idx} className="flex flex-col space-y-1" id={`branch-row-${idx}`}>
                  <div className="flex items-center justify-between text-xs" id={`branch-meta-${idx}`}>
                    <span className="font-medium text-slate-300 font-sans flex items-center gap-1.5">
                      {isHQ ? <Building className="w-3.5 h-3.5 text-indigo-400" /> : <CheckCircle className="w-3.5 h-3.5 text-slate-500" />}
                      {b.label}
                    </span>
                    <span className="font-mono text-slate-400">
                      ${b.value.toLocaleString()} <span className="text-[10px] text-slate-500">({share.toFixed(1)}%)</span>
                    </span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800/40" id={`branch-prog-${idx}`}>
                    <div 
                      className={`h-full rounded-full ${isHQ ? 'bg-indigo-500' : 'bg-slate-500'}`} 
                      style={{ width: `${share}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anomaly Highlight banner & Interactive insight panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="anomaly-insight-banner">
          <div id="anomaly-insight-header">
            <div className="flex items-center gap-2 mb-2" id="alert-badge-group">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-sm bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4" /> BOTTLENECK ALERT DEVIATION
              </span>
            </div>
            <h3 className="text-base font-semibold text-slate-200 font-sans mt-2">MID-MAY SYSTEM ANOMALY FOUND</h3>
            <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed">
              Our forecasting models automatically flagged severe multi-point deviations in standard operations between <strong className="text-slate-200">May 17 and May 23, 2026</strong>. 
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 my-3 text-xs" id="anomaly-timeline-insight">
            <div className="flex items-start gap-2.5 font-sans" id="anomaly-insight-row-1">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-none block"></div>
              <div>
                <p className="text-slate-300 font-semibold">East Metro Outlet (Branch ID: B04)</p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">May 17-21: -85% orders transaction failure (local supply runs delayed)</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 font-sans mt-3" id="anomaly-insight-row-2">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-none block"></div>
              <div>
                <p className="text-slate-300 font-semibold">North Hub Headquarters (Branch ID: B01)</p>
                <p className="text-slate-500 font-mono text-[11px] mt-0.5">May 20-23: -50% purchase failure (cascading inventory depletion)</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-sans text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer" id="goto-anomaly-controls">
            <span>Access the Anomaly Detection & Forecasting Simulator to analyze thresholds</span>
            <span className="font-bold">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
