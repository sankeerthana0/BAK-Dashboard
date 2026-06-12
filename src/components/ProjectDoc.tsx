/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  FileText, 
  CheckSquare, 
  Lightbulb, 
  Settings, 
  ShieldCheck, 
  Info,
  Database,
  Terminal,
  Paperclip,
  CheckCircle,
  HelpCircle,
  Bookmark
} from 'lucide-react';

export default function ProjectDoc() {
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'checklist' | 'schema'>('architecture');

  const checklistItems = [
    {
      category: 'Data Integration & SQL Pipeline',
      items: [
        { label: 'Validated relational primary key integrity across orders/branches.', checked: true },
        { label: 'Cross-checked aggregated output totals matching CTE logic.', checked: true },
        { label: 'Verified window analytical boundaries (ROW_NUMBER over regions).', checked: true },
        { label: 'Ensured NULL handler fallbacks (COALESCE/IFNULL statement covers).', checked: true }
      ]
    },
    {
      category: 'Forecasting & Anomaly Modelling',
      items: [
        { label: 'Evaluated standard deviation thresholds capturing May 17-23 supply drops.', checked: true },
        { label: 'A/B tested flagging velocities to reach immediate 2.0x efficiency gains.', checked: true },
        { label: 'Validated upper/lower model confidence interval widths.', checked: true }
      ]
    },
    {
      category: 'Power BI Dashboard Validation',
      items: [
        { label: 'Configured responsive cross-filtering triggers across widgets.', checked: true },
        { label: 'Matched color scale hierarchies tracking critical margin outliers.', checked: true },
        { label: 'Added clear hover tooltips detailing precise basket values.', checked: true }
      ]
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col" id="project-doc-workspace">
      {/* Sub menu controls */}
      <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3" id="doc-sub-menu">
        <div className="flex items-center gap-2" id="doc-title-block">
          <FileText className="text-indigo-400 w-5 h-5" id="doc-icon" />
          <span className="text-sm font-bold text-slate-300 font-sans uppercase tracking-wider">Dashboard Documentation Hub</span>
        </div>

        <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 self-start sm:self-auto" id="doc-tabs-grp">
          {(['architecture', 'schema', 'checklist'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`text-[11px] font-mono font-bold px-3 py-1.5 rounded transition cursor-pointer ${
                activeSubTab === tab 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              id={`doc-sub-tab-${tab}`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 overflow-y-auto max-h-[580px] space-y-6" id="doc-body-workspace">
        {activeSubTab === 'architecture' && (
          <div className="space-y-6" id="doc-arch-module">
            {/* Overview block */}
            <div className="space-y-2 font-sans" id="arch-overview">
              <h3 className="text-base font-semibold text-slate-200">System Architecture Overview</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The <strong className="text-slate-300">BAK KPI Analytics Dashboard</strong> is engineered around a modular, three-tiered business intelligence pipeline. It captures transactional, branch-specific, and financial event streams in a raw relational repository, applies advanced SQL transformations via CTEs and Window operations, and visualizes the structured outputs through predictive panels.
              </p>
            </div>

            {/* Pipeline Step cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="arch-cards-row">
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col gap-2" id="arch-card-1">
                <Database className="w-5 h-5 text-indigo-400" id="step-icon-1" />
                <span className="text-xs font-bold text-slate-300">1. Structured SQL Storage</span>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  Transactional events mapping customer orders, operational expenses, and physical branch hierarchies are cataloged within relational schemas.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col gap-2" id="arch-card-2">
                <Terminal className="w-5 h-5 text-yellow-500" id="step-icon-2" />
                <span className="text-xs font-bold text-slate-300">2. CTE & Aggregation Pipeline</span>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  Analytical queries synthesize raw event metrics into rolling averages, customer LTV vectors, and territorial performance sequence matrices.
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col gap-2" id="arch-card-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" id="step-icon-3" />
                <span className="text-xs font-bold text-slate-300">3. Anomaly Forecasting View</span>
                <p className="text-[11px] text-slate-500 leading-normal font-sans">
                  A high-speed mathematical forecasting engine calculates confidence margins and flags operational anomalies twice (2×) as fast as manual intervention.
                </p>
              </div>
            </div>

            {/* Power BI design system notes */}
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4.5" id="powerbi-guidelines">
              <div className="flex items-start gap-3" id="pbi-text-and-icon-group">
                <Bookmark className="w-5 h-5 text-yellow-400 mt-0.5 flex-none" id="bookmark-icon" />
                <div className="font-sans text-xs text-slate-400" id="pbi-details-block">
                  <span className="font-bold text-slate-300 block mb-1">Power BI Interactive Dashboard Blueprint</span>
                  Our visual layout mirrors enterprise Power BI reports: the primary dashboard page establishes high-level progress (EBIT totals, gross margin); secondary cross-filtered tabs drill down into physical branch contributions. Hovering over list rows highlights precise margins, and the custom color palette triggers bright warmth values on optimal nodes and soft alert markers over outliers.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'schema' && (
          <div className="space-y-5" id="doc-schema-module">
            <div className="space-y-1.5 font-sans" id="schema-intro">
              <h3 className="text-base font-semibold text-slate-200">Database Relational Schema Models</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Sleek physical schemas documenting raw operational inputs leveraged within analytical joins and groupings.
              </p>
            </div>

            <div className="space-y-4" id="schema-details-cards">
              <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-xs text-slate-300" id="schema-card-1">
                <span className="font-bold text-indigo-400 block mb-2 font-sans">TABLE `orders` (Source: raw_transactions)</span>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2 text-[11px]" id="orders-rows font-mono">
                  <div>orderId : VARCHAR(32) [PK]</div>
                  <div>branchId : VARCHAR(16) [FK]</div>
                  <div>customerId : VARCHAR(32)</div>
                  <div>orderDate : DATE</div>
                  <div>amount : DECIMAL(12,2)</div>
                  <div>category : VARCHAR(128)</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-xs text-slate-300" id="schema-card-2">
                <span className="font-bold text-indigo-400 block mb-2 font-sans">TABLE `branches` (Source: outlet_hierarchy)</span>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2 text-[11px]" id="branches-rows font-mono">
                  <div>branchId : VARCHAR(16) [PK]</div>
                  <div>branchName : VARCHAR(128)</div>
                  <div>manager : VARCHAR(128)</div>
                  <div>type : ENUM(&apos;HQ&apos;, &apos;Branch&apos;)</div>
                  <div>region : VARCHAR(64)</div>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-850 rounded-lg p-4 font-mono text-xs text-slate-300" id="schema-card-3">
                <span className="font-bold text-indigo-400 block mb-2 font-sans">TABLE `operating_costs` (Source: treasury_ledger)</span>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-900 pt-2 text-[11px]" id="costs-rows font-mono">
                  <div>date : DATE [PK_COMP]</div>
                  <div>branchId : VARCHAR(16) [PK_COMP] [FK]</div>
                  <div>staffCost : INTEGER</div>
                  <div>rentCost : INTEGER</div>
                  <div>otherCost : INTEGER</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'checklist' && (
          <div className="space-y-5" id="doc-checklist-module">
            <div className="space-y-1.5 font-sans" id="check-intro">
              <h3 className="text-base font-semibold text-slate-200">Production QA Checklists</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full verification frameworks followed during the project design, aggregation scripting, and predictive threshold tuning processes.
              </p>
            </div>

            <div className="space-y-4" id="checklists-scroller">
              {checklistItems.map((sec, secIdx) => (
                <div key={secIdx} className="bg-slate-950 border border-slate-850 rounded-lg p-4" id={`sec-check-group-${secIdx}`}>
                  <span className="text-xs font-bold text-slate-300 block mb-3 font-sans border-b border-slate-900 pb-1.5 uppercase tracking-wide">
                    {sec.category}
                  </span>
                  <div className="space-y-2 font-sans" id={`sec-check-lines-${secIdx}`}>
                    {sec.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-400" id={`chk-row-${secIdx}-${idx}`}>
                        <div className="w-4 h-4 bg-emerald-500/15 border border-emerald-500/30 rounded flex items-center justify-center text-emerald-400 flex-none" id={`chk-check-${secIdx}-${idx}`}>
                          ✓
                        </div>
                        <span className="leading-snug">{it.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
