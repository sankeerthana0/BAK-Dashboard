/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Building, 
  Terminal, 
  Settings, 
  CheckCircle, 
  BarChart3, 
  HelpCircle,
  Database,
  Search,
  BookOpen,
  Sliders,
  Sparkles,
  Network,
  Trash2,
  FileText
} from 'lucide-react';

import DashboardView from './components/DashboardView';
import SQLEngine from './components/SQLEngine';
import BranchCorrelation from './components/BranchCorrelation';
import ForecastingPanel from './components/ForecastingPanel';
import ProjectDoc from './components/ProjectDoc';

type ActiveTab = 'kpis' | 'sql' | 'correlation' | 'forecast' | 'docs';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('kpis');
  const [selectedSQLQueryId, setSelectedSQLQueryId] = useState<string>('q1');
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'System init successful.',
    'Loaded transactional logs table (orders: 540 records cached).',
    'Booted in-memory SQL execution engine (SQLite v3.x emulation active).',
    'Active forecasting model loaded: Standard Double Exponential Baseline.'
  ]);

  // Handler to push a clean system operational log
  const handleAddNewLog = (message: string) => {
    const timestamp = new Date().toISOString().split('T')[1].substring(0, 8);
    setSystemLogs(prev => [
      `[${timestamp}] ${message}`,
      ...prev.slice(0, 24) // limit to past 25 records to keep cache lightweight
    ]);
  };

  const handleNavigateToSQL = (queryId: string) => {
    setSelectedSQLQueryId(queryId);
    setActiveTab('sql');
    handleAddNewLog(`Drilled down in metrics: swapped to view query '${queryId}'`);
  };

  const clearSystemLogs = () => {
    setSystemLogs([`[${new Date().toISOString().split('T')[1].substring(0, 8)}] Console memory flushed.`]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" id="app-root-workspace">
      {/* Prime Corporate Header */}
      <header className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-800/80 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-sans select-none sticky top-0 z-50" id="app-corporate-header">
        <div className="flex items-center gap-3" id="header-brand">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold select-none text-base shadow-md shadow-indigo-600/20" id="brand-avatar">
            BAK
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight font-sans">BAK Operations Dashboard</h1>
            <p className="text-[11px] text-slate-400 font-mono font-medium mt-0.5">BUSINESS KPI ANALYTICS SYSTEM • PYTHON · SQL · POWER BI · STREAMLIT</p>
          </div>
        </div>

        {/* Global operational indicators */}
        <div className="flex items-center gap-6 text-xs font-mono self-start sm:self-auto" id="global-indicators font-mono">
          <div className="hidden md:flex flex-col text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Acquisition Time</span>
            <span className="text-slate-300 font-medium">UTC 2026-06-12</span>
          </div>
          <div className="flex items-center gap-1.5 font-sans bg-slate-950 border border-slate-800/80 rounded-full px-3 py-1 text-slate-300" id="indicator-badge">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping block"></span>
            <span className="text-[11px] font-mono font-bold uppercase">SQL Cache Ready</span>
          </div>
        </div>
      </header>

      {/* Main Structural Body */}
      <div className="flex-1 flex flex-col lg:flex-row items-stretch overflow-hidden" id="app-structural-body">
        {/* Sidebar Navigator */}
        <nav className="w-full lg:w-64 bg-slate-900 border-r lg:border-r-slate-800 border-b lg:border-b-0 border-slate-800 p-4 flex flex-row lg:flex-col justify-start gap-1 py-4 lg:py-5 shrink-0 overflow-x-auto select-none" id="sidebar-navigation">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider mb-2.5 hidden lg:block px-3">
            Analytical Modules
          </span>

          <button
            onClick={() => {
              setActiveTab('kpis');
              handleAddNewLog('Swapped to Primary KPI Dashboard module.');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 cursor-pointer ${
              activeTab === 'kpis' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/10 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="nav-btn-kpis"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" /> KPI Dashboard
          </button>

          <button
            onClick={() => {
              setActiveTab('sql');
              handleAddNewLog('Swapped to SQL Query Transform simulator.');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 cursor-pointer ${
              activeTab === 'sql' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/10 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="nav-btn-sql"
          >
            <Database className="w-4 h-4 text-indigo-400" /> SQL Transformations
          </button>

          <button
            onClick={() => {
              setActiveTab('correlation');
              handleAddNewLog('Swapped to HQ & Branches Logistical coupling map.');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 cursor-pointer ${
              activeTab === 'correlation' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/10 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="nav-btn-correlation"
          >
            <Network className="w-4 h-4 text-indigo-400" /> Logistical Coupling
          </button>

          <button
            onClick={() => {
              setActiveTab('forecast');
              handleAddNewLog('Swapped to Anomaly Detection & Forecasting Simulator.');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 cursor-pointer ${
              activeTab === 'forecast' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/10 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="nav-btn-forecast"
          >
            <Sliders className="w-4 h-4 text-indigo-400" /> Deviation Forecasting
          </button>

          <button
            onClick={() => {
              setActiveTab('docs');
              handleAddNewLog('Opened Project QA Documentation Hub.');
            }}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-medium font-sans transition-all shrink-0 cursor-pointer ${
              activeTab === 'docs' 
                ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/10 border border-indigo-500/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            id="nav-btn-docs"
          >
            <FileText className="w-4 h-4 text-indigo-400" /> QA Documentation
          </button>

          {/* Divider and system labels inside sidebar */}
          <div className="hidden lg:block border-t border-slate-800/80 my-4 pt-3.5" id="sidebar-meta-grp">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block px-3 mb-2.5">
              Technical Stack
            </span>
            <div className="space-y-1.5 px-3 text-[10px] text-slate-400 font-mono uppercase" id="stack-list font-mono">
              <div>Python • SQL • Pandas</div>
              <div>Streamlit • Power BI</div>
              <div>SQLite Engine • Recharts</div>
            </div>
          </div>
        </nav>

        {/* Major Workspaces Canvas */}
        <main className="flex-1 p-6 overflow-y-auto" id="app-canvas-workspace">
          {activeTab === 'kpis' && (
            <DashboardView onAddLog={handleAddNewLog} onNavigateToSQL={handleNavigateToSQL} />
          )}
          {activeTab === 'sql' && (
            <SQLEngine 
              onAddLog={handleAddNewLog} 
              selectedQueryId={selectedSQLQueryId} 
              onChangeQueryId={setSelectedSQLQueryId} 
            />
          )}
          {activeTab === 'correlation' && (
            <BranchCorrelation onAddLog={handleAddNewLog} />
          )}
          {activeTab === 'forecast' && (
            <ForecastingPanel onAddLog={handleAddNewLog} />
          )}
          {activeTab === 'docs' && (
            <ProjectDoc />
          )}
        </main>

        {/* Live Interaction HUD Console Stream (Collapsible drawer layout for monitor outputs) */}
        <aside className="w-full lg:w-72 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4.5 flex flex-col justify-between shrink-0" id="live-hud-logs-panel">
          <div className="flex flex-col flex-1 overflow-hidden" id="live-hud-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3" id="hud-head">
              <span className="text-xs font-bold text-slate-300 font-sans tracking-wide uppercase flex items-center gap-1.5">
                <Terminal className="text-blue-500 w-4 h-4 animate-pulse" id="terminal-pulse-icon" /> Live Operator Feed
              </span>
              <button 
                onClick={clearSystemLogs}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Flush Console Log Cache"
                id="clear-logs-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Continuous stream lists */}
            <div className="flex-1 font-mono text-[10px] text-slate-400 space-y-2 overflow-y-auto max-h-[140px] lg:max-h-[380px] pr-1 leading-normal" id="hud-logs-scroller font-mono">
              {systemLogs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start" id={`system-log-line-${index}`}>
                  <span className="text-slate-650 flex-none select-none block">›</span>
                  <div className="break-all">{log}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/60 pt-3.5 mt-3 hidden lg:block text-[11px] text-slate-400 font-sans" id="hud-foot">
            <p className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Interactive UI State
            </p>
            <p className="text-slate-500 leading-normal">
              Click metrics, adjust thresholds, and select SQL queries to trigger reactive recalculations across all dashboard models on-the-fly.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
