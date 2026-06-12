/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Database, 
  Terminal, 
  Play, 
  Sparkles, 
  ListFilter, 
  Layers, 
  Table as TableIcon,
  CheckCircle,
  Copy,
  Code
} from 'lucide-react';
import { STATIC_SQL_QUERIES, executeMockSQLQuery, ALL_TRANSACTIONS, ALL_BRANCHES, ALL_OPERATING_COSTS } from './DBData';

interface SQLEngineProps {
  onAddLog: (message: string) => void;
  selectedQueryId: string;
  onChangeQueryId: (id: string) => void;
}

export default function SQLEngine({ onAddLog, selectedQueryId, onChangeQueryId }: SQLEngineProps) {
  const [activeTab, setActiveTab] = useState<'sql' | 'raw_tables'>('sql');
  const [selectedRawTable, setSelectedRawTable] = useState<'orders' | 'branches' | 'operating_costs'>('orders');
  const [executing, setExecuting] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [queryResults, setQueryResults] = useState<any[]>(executeMockSQLQuery(selectedQueryId));
  const [copied, setCopied] = useState(false);

  const activeQuery = STATIC_SQL_QUERIES.find(q => q.id === selectedQueryId) || STATIC_SQL_QUERIES[0];

  const handleQuerySelect = (id: string) => {
    onChangeQueryId(id);
    const results = executeMockSQLQuery(id);
    setQueryResults(results);
    setExecutionLog([]);
    onAddLog(`Selected SQL query template: ${id}`);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeQuery.code);
    setCopied(true);
    onAddLog(`Copied SQL Query code: ${activeQuery.title}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunQuery = () => {
    setExecuting(true);
    setExecutionLog([]);
    
    // Simulate real database parsing pipelines logs
    const logs = [
      `[INFO] Initializing BAK-SQL Query Compiler Core v2.4`,
      `[INFO] Parsing target: CTE blocks (WITH clauses)...`,
      `[INFO] Mapping relational joins on branchId & customerId keys...`,
      `[INFO] Appending statistical aggregations and partition criteria...`
    ];

    if (activeQuery.code.includes('OVER(')) {
      logs.push(`[WINDOW] Instantiating Partition Window Engine (ROW_NUMBER / SUM)...`);
    }
    if (activeQuery.code.includes('LAG(')) {
      logs.push(`[WINDOW] Analyzing relative lag temporal discrepancies...`);
    }

    logs.push(`[INFO] Fetching records from raw data (orders: ${ALL_TRANSACTIONS.length}, branches: ${ALL_BRANCHES.length})`);
    
    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < logs.length) {
        setExecutionLog(prev => [...prev, logs[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(interval);
        const results = executeMockSQLQuery(activeQuery.id);
        setQueryResults(results);
        setExecuting(false);
        setExecutionLog(prev => [...prev, `[SUCCESS] Compiled successfully. Executed in 12ms. Rows returned: ${results.length}`]);
        onAddLog(`Compiled and executed SQL transformation: '${activeQuery.title}'`);
      }
    }, 250);
  };

  // Raw rows helper formatter
  const renderRawTableRows = () => {
    if (selectedRawTable === 'orders') {
      return (
        <table className="w-full text-slate-300 text-xs font-mono" id="raw-table-orders font-mono">
          <thead>
            <tr className="bg-slate-950 text-slate-500 border-b border-slate-800 text-left">
              <th className="p-2.5">orderId</th>
              <th className="p-2.5">branchId</th>
              <th className="p-2.5">customerId</th>
              <th className="p-2.5">orderDate</th>
              <th className="p-2.5 text-right">amount</th>
              <th className="p-2.5">category</th>
            </tr>
          </thead>
          <tbody>
            {ALL_TRANSACTIONS.slice(0, 8).map((t, i) => (
              <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-900/40 transition-colors">
                <td className="p-2.5 text-blue-400 font-bold">{t.orderId}</td>
                <td className="p-2.5">{t.branchId}</td>
                <td className="p-2.5">{t.customerId}</td>
                <td className="p-2.5">{t.orderDate}</td>
                <td className="p-2.5 text-right text-emerald-400 font-semibold">${t.amount}</td>
                <td className="p-2.5 truncate max-w-[150px]">{t.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (selectedRawTable === 'branches') {
      return (
        <table className="w-full text-slate-300 text-xs font-mono" id="raw-table-branches font-mono">
          <thead>
            <tr className="bg-slate-950 text-slate-500 border-b border-slate-800 text-left">
              <th className="p-2.5">branchId</th>
              <th className="p-2.5">branchName</th>
              <th className="p-2.5">manager</th>
              <th className="p-2.5">type</th>
              <th className="p-2.5">region</th>
            </tr>
          </thead>
          <tbody>
            {ALL_BRANCHES.map((b, i) => (
              <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-900/40">
                <td className="p-2.5 text-blue-400 font-semibold">{b.branchId}</td>
                <td className="p-2.5 font-bold text-slate-200">{b.branchName}</td>
                <td className="p-2.5">{b.manager}</td>
                <td className="p-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] ${b.type === 'HQ' ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>{b.type}</span>
                </td>
                <td className="p-2.5">{b.region}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      return (
        <table className="w-full text-slate-300 text-xs font-mono" id="raw-table-costs font-mono">
          <thead>
            <tr className="bg-slate-950 text-slate-500 border-b border-slate-800 text-left">
              <th className="p-2.5">date</th>
              <th className="p-2.5">branchId</th>
              <th className="p-2.5 text-right">staffCost</th>
              <th className="p-2.5 text-right">rentCost</th>
              <th className="p-2.5 text-right">otherCost</th>
            </tr>
          </thead>
          <tbody>
            {ALL_OPERATING_COSTS.slice(0, 8).map((c, i) => (
              <tr key={i} className="border-b border-slate-800/40 hover:bg-slate-900/40">
                <td className="p-2.5 text-slate-400">{c.date}</td>
                <td className="p-2.5 text-blue-400">{c.branchId}</td>
                <td className="p-2.5 text-right font-semibold">${c.staffCost}</td>
                <td className="p-2.5 text-right">${c.rentCost}</td>
                <td className="p-2.5 text-right">${c.otherCost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="sql-engine-container">
      {/* Sidebar - Query templates selection list */}
      <div className="lg:col-span-4 space-y-4" id="sql-templates-sidebar">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm" id="sql-sidebar-inner">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-3" id="sql-header-group">
            <Database className="text-indigo-400 w-5 h-5" id="sql-db-icon" />
            <span className="text-sm font-bold text-slate-300 font-sans uppercase tracking-wider">SQL Transformation Templates</span>
          </div>

          <div className="space-y-2" id="sql-query-links">
            {STATIC_SQL_QUERIES.map(q => (
              <button
                key={q.id}
                onClick={() => handleQuerySelect(q.id)}
                className={`w-full text-left p-3 rounded-lg border text-xs font-sans transition-all flex flex-col gap-1.5 hover:border-indigo-500/60 cursor-pointer ${
                  q.id === selectedQueryId 
                    ? 'bg-indigo-605/10 border-indigo-500 text-indigo-400 font-semibold shadow-xs' 
                    : 'bg-slate-950 border-slate-800/80 text-slate-400'
                }`}
                id={`sql-select-${q.id}`}
              >
                <span>{q.title}</span>
                <span className="text-[10px] text-slate-500 font-mono font-normal tracking-tight line-clamp-1">
                  {q.description}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg text-xs" id="sql-sidebar-footer">
            <div className="flex items-center gap-2 text-slate-400 font-bold mb-1" id="sql-bullet-label">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Relational Blueprint
            </div>
            <p className="text-slate-500 font-sans leading-relaxed text-[11px]">
              We aggregate transactional arrays to create dashboard values using Common Table Expressions (CTEs), multi-table relational joins, and Window analytical sets.
            </p>
          </div>
        </div>

        {/* Technical Features Tag panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4" id="sql-features-tags">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">SQL Concepts Leveraged</span>
          <div className="flex flex-wrap gap-2 text-[10px] font-mono" id="sql-chips-grp">
            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-1 rounded">WITH (CTEs)</span>
            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-1 rounded">PARTITION BY</span>
            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-1 rounded">ROW_NUMBER()</span>
            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-1 rounded">LAG() OVER()</span>
            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-1 rounded">INNER / LEFT JOIN</span>
            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-1 rounded">GROUP BY / HAVING</span>
          </div>
        </div>
      </div>

      {/* Main SQL Editor & Display workspace */}
      <div className="lg:col-span-8 flex flex-col gap-6" id="sql-main-editor-view">
        {/* Workspace Tab header toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between shadow-xs" id="sql-view-tabs">
          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-lg" id="sql-tabs-grp">
            <button
              onClick={() => {
                setActiveTab('sql');
                onAddLog(`Swapped schema editor view to SQL transform module`);
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium font-sans transition-colors cursor-pointer ${
                activeTab === 'sql' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="tab-btn-sql"
            >
              <Code className="w-4 h-4" /> SQL Editor
            </button>
            <button
              onClick={() => {
                setActiveTab('raw_tables');
                onAddLog(`Swapped schema editor view to raw transaction Tables inspect module`);
              }}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium font-sans transition-colors cursor-pointer ${
                activeTab === 'raw_tables' 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id="tab-btn-raw"
            >
              <TableIcon className="w-4 h-4" /> Raw Source Tables
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 font-semibold" id="sql-engine-meta">
            Relational DB Engine: SQLite (In-Memory Simulator)
          </div>
        </div>

        {activeTab === 'sql' ? (
          <>
            {/* Editor Console panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-sm" id="sql-editor-panel">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between" id="editor-header">
                <div className="flex items-center gap-2" id="editor-title-grp">
                  <Terminal className="text-indigo-400 w-4 h-4" id="editor-terminal-icon" />
                  <span className="text-xs font-bold text-slate-300 font-mono tracking-tight">{activeQuery.title}</span>
                </div>
                <div className="flex items-center gap-2" id="editor-actions">
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition-colors"
                    title="Copy Query"
                    id="copy-sql-btn"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={handleRunQuery}
                    disabled={executing}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                    id="run-sql-btn"
                  >
                    <Play className="w-3 h-3 fill-current" /> {executing ? 'RUNNING...' : 'RUN QUERY'}
                  </button>
                </div>
              </div>

              {/* Precise structured query code block */}
              <div className="p-4 bg-slate-950 font-mono text-[11px] overflow-auto h-[260px] leading-relaxed text-indigo-300 select-all whitespace-pre" id="sql-editor-code-container font-mono">
                {activeQuery.code}
              </div>
            </div>

            {/* Execution logs feed */}
            {executionLog.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-slate-400 space-y-1 h-[100px] overflow-y-auto shadow-inner" id="sql-execution-logs">
                {executionLog.map((log, idx) => (
                  <div key={idx} className={`${log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : log.includes('WINDOW') ? 'text-indigo-400' : 'text-slate-500'}`} id={`sql-log-line-${idx}`}>
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Generated results grid display */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="sql-results-panel">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3" id="results-header">
                <div>
                  <h4 className="text-sm font-semibold text-slate-200 font-sans">Pipeline Analytical Output</h4>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">TRANSFORMED DASHBOARD-READY STRUCTURAL DATA</p>
                </div>
                <div className="flex items-center gap-2" id="results-count-badge">
                  <Sparkles className="w-4 h-4 text-emerald-400" id="res-badge-sparkle" />
                  <span className="text-[11px] font-mono font-bold bg-slate-950 px-2 py-0.5 rounded text-emerald-400 border border-emerald-500/20 shadow-xs">
                    CTE aggregation correct
                  </span>
                </div>
              </div>

              {/* Dynamic schema columns output */}
              <div className="overflow-x-auto" id="sql-output-scroll">
                {executing ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2" id="results-spinner">
                    <span className="w-8 h-8 rounded-full border-2 border-slate-800 border-t-indigo-500 animate-spin block"></span>
                    <span className="text-xs font-mono text-slate-500">Querying transaction log tables...</span>
                  </div>
                ) : queryResults.length === 0 ? (
                  <div className="py-12 text-center text-xs font-mono text-slate-500" id="results-none">Empty query rows</div>
                ) : (
                  <table className="w-full text-left text-slate-300 text-xs font-mono" id="analytical-output-table">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                        {activeQuery.targetMetrics.map(col => (
                          <th key={col} className="p-2.5 capitalize">{col.replace(/_/g, ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResults.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-slate-800/40 hover:bg-slate-900/30 transition-all" id={`res-row-${rowIdx}`}>
                          {activeQuery.targetMetrics.map(col => {
                            const val = row[col];
                            let formatted = val;
                            if (typeof val === 'number') {
                              if (col.includes('ratio') || col.includes('percentage') || col.includes('margin')) {
                                formatted = `${val}%`;
                              } else if (col.includes('spent') || col.includes('ltv') || col.includes('investment') || col.includes('sales') || col.includes('revenue') || col.includes('overhead') || col.includes('expenses') || col.includes('profit') || col.includes('average_basket')) {
                                formatted = `$${val.toLocaleString()}`;
                              } else {
                                formatted = val.toLocaleString();
                              }
                            }
                            const isHighlight = col.includes('ltv_cac_ratio') || col.includes('operating_profit_margin') || col.includes('territorial_rank');
                            return (
                              <td key={col} className={`p-2.5 ${isHighlight ? 'text-indigo-400 font-bold' : ''}`} id={`res-cell-${rowIdx}-${col}`}>
                                {formatted === null || formatted === undefined ? 'NULL' : String(formatted)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="raw-tables-panel">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-slate-800 pb-4" id="raw-table-header">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 font-sans flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" /> Relational Physical Models
                </h3>
                <p className="text-xs text-slate-500 font-sans mt-0.5">PRE-COMPILEDS TO COMPUTE INBOUND REVENUES</p>
              </div>

              {/* Multi-table selectors */}
              <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-lg gap-1.5 self-start sm:self-auto" id="raw-tables-toggles">
                {(['orders', 'branches', 'operating_costs'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setSelectedRawTable(tab);
                      onAddLog(`Browsing raw source table structure: ${tab}`);
                    }}
                    className={`text-[11px] font-mono px-3 py-1.5 rounded transition bg-opacity-90 cursor-pointer ${
                      selectedRawTable === tab 
                        ? 'bg-indigo-600 text-white font-semibold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    id={`raw-tab-btn-${tab}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
              Below is a snapshot of our schema design representing 
              {selectedRawTable === 'orders' ? ' raw customer transactions' : selectedRawTable === 'branches' ? ' physical operating outlet details' : ' branch daily operating expenses'}.
              These tables are combined, grouped, and filtered to compile the processed analytics.
            </p>

            <div className="overflow-x-auto border border-slate-800/80 rounded-lg bg-slate-950/40" id="raw-table-container">
              {renderRawTableRows()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-3" id="raw-table-rows-count">
              Showing first 8 records. Real database logs total {selectedRawTable === 'orders' ? ALL_TRANSACTIONS.length : selectedRawTable === 'branches' ? ALL_BRANCHES.length : ALL_OPERATING_COSTS.length} records.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
