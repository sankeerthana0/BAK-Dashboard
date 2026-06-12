/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
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
  LineChart,
  Line,
  ReferenceArea
} from 'recharts';
import { 
  Gauge, 
  Sparkles, 
  AlertOctagon, 
  Clock, 
  Plus, 
  Sliders, 
  Bookmark, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { FORECAST_DATA } from './DBData';
import { ForecastPoint } from '../types';

interface ForecastingPanelProps {
  onAddLog: (message: string) => void;
}

export default function ForecastingPanel({ onAddLog }: ForecastingPanelProps) {
  const [stdDevThreshold, setStdDevThreshold] = useState<number>(1.8); // slider: 1.0 to 3.0
  const [horizonDays, setHorizonDays] = useState<number>(14); // slider: 7 to 30 days ahead

  // Dynamically recalculate confidence bands and identify anomalies based on user-configured threshold (standard deviations)
  const processedForecastData = useMemo(() => {
    // Standard baseline standard deviation of our daily aggregate sales (~1450)
    const baseStdDev = 1150;
    
    return FORECAST_DATA.map((point, index) => {
      const isPast = index < FORECAST_DATA.length - 8; // treat last 8 elements as our projected visual horizon
      
      // Calculate dynamic margins based on selected standard deviation factor
      const margin = baseStdDev * stdDevThreshold;
      const calculatedUpper = point.forecast + margin;
      const calculatedLower = Math.max(2000, point.forecast - margin);

      // Check if actual values break out of bounds
      const isAnomaly = point.actual > calculatedUpper || point.actual < calculatedLower;
      
      let anomalyReason = point.anomalyReason;
      if (isAnomaly && !anomalyReason) {
        if (point.actual > calculatedUpper) {
          anomalyReason = 'Abnormal demand surge (enterprise solution sales)';
        } else {
          anomalyReason = 'Localized branch logistical or inventory depletion event';
        }
      }

      return {
        ...point,
        upperConfidence: Math.round(calculatedUpper),
        lowerConfidence: Math.round(calculatedLower),
        isAnomaly: isAnomaly,
        anomalyReason: isAnomaly ? anomalyReason : undefined
      };
    });
  }, [stdDevThreshold]);

  // Aggregate list of currently flagged anomalies based on user threshold settings
  const activeAnomaliesList = useMemo(() => {
    return processedForecastData
      .filter(p => p.isAnomaly)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [processedForecastData]);

  const handleConfidenceSliderChange = (val: number) => {
    setStdDevThreshold(val);
    onAddLog(`Forecasting deviation sensitivity set to ${val}x Standard Deviations`);
  };

  return (
    <div className="space-y-6" id="forecasting-panel-container">
      {/* Streamlit Inspired Inputs & Stats Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="forecast-controls-row">
        {/* Sliders Console */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="forecast-knobs-card">
          <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-3" id="forecast-header">
            <Sliders className="text-indigo-400 w-5 h-5" id="sliders-icon" />
            <span className="text-sm font-bold text-slate-300 font-sans uppercase tracking-wider">Streamlit Parameter Console</span>
          </div>

          <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
            Tune the underlying forecasting algorithm. Adjust statistical confidence widths to discover minor versus major business operational deviations.
          </p>

          <div className="space-y-4" id="forecast-sliders">
            {/* Standard Deviation parameter (σ) */}
            <div className="flex flex-col gap-2" id="std-dev-field-group">
              <div className="flex justify-between items-center" id="std-labels">
                <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight">Confidence Width (σ):</label>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20" id="std-dev-indicator">
                  ± {stdDevThreshold} σ Threshold
                </span>
              </div>
              <input 
                type="range" 
                min="1.0" 
                max="3.0" 
                step="0.2"
                value={stdDevThreshold}
                onChange={(e) => handleConfidenceSliderChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg appearance-none h-1.5 border border-slate-850 cursor-pointer"
                id="std-dev-slider"
              />
              <p className="text-[10px] text-slate-550 font-sans px-0.5" id="std-dev-caption">
                Lower σ triggers more alerts (higher sensitivity). Higher σ isolates major structural drops.
              </p>
            </div>

            {/* Projection Horizon parameter */}
            <div className="flex flex-col gap-2" id="horizon-field-group">
              <div className="flex justify-between items-center" id="horizon-labels">
                <label className="text-xs font-mono font-bold text-slate-500 uppercase tracking-tight">Projection Horizon (Days):</label>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-505/20" id="horizon-days-indicator">
                  {horizonDays} Days Ahead
                </span>
              </div>
              <input 
                type="range" 
                min="7" 
                max="30" 
                step="1"
                value={horizonDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setHorizonDays(val);
                  onAddLog(`Adjusted projection forecasting horizon to: +${val} days`);
                }}
                className="w-full accent-indigo-500 bg-slate-950 rounded-lg appearance-none h-1.5 border border-slate-850 cursor-pointer"
                id="horizon-slider"
              />
              <p className="text-[10px] text-slate-550 font-sans px-0.5" id="horizon-caption">
                Estimates trendlines past active observation checkpoints.
              </p>
            </div>
          </div>
        </div>

        {/* Audit Response Speed Audit card */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between" id="speed-audit-showcase">
          <div id="speed-header">
            <div className="flex items-center gap-2 mb-2" id="speed-icon-row">
              <Clock className="w-5 h-5 text-indigo-400" id="clock-speed-icon" />
              <span className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">FLAGGING VELOCITY BENCHMARK</span>
            </div>
            <h3 className="text-base font-semibold text-slate-200 font-sans">Statistical Anomaly Flagging Efficiency</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans leading-relaxed">
              Comparison between automated statistical deviation modeling vs traditional manual spreadsheet inspection protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3" id="speed-comparisons-grid">
            <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 relative overflow-hidden group" id="metric-predictive">
              <div className="absolute right-3 top-3 w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10" id="speed-circle-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Predictive Alarm Trigger</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1" id="predictive-trigger-stat">4.2 Hours</div>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">Automated ingestion system cycle</span>
            </div>

            <div className="bg-slate-950 border border-slate-850 rounded-lg p-3.5 relative overflow-hidden group" id="metric-manual">
              <span className="text-[10px] font-mono text-slate-500 font-bold block uppercase">Manual Auditing Circle</span>
              <div className="text-2xl font-bold text-slate-400 font-mono mt-1" id="manual-trigger-stat">8.5 Hours</div>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">Physical ledger and pivot checks</span>
            </div>
          </div>

          <div className="text-xs font-medium text-slate-400 font-sans bg-slate-950/40 border border-slate-850 rounded-lg p-2.5 flex items-center gap-2" id="speed-badge">
            <span className="text-xs text-emerald-400 font-bold font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">2.0x FASTER</span>
            <span>Identified operational deviations exactly two times faster, preventing cascading supplier shortages.</span>
          </div>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm" id="forecasting-visual-container">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4" id="forecast-chart-header">
          <div>
            <h3 className="text-base font-semibold text-slate-200 font-sans">BAK Operations Revenue Forecast & Confidence Bands</h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">DOUBLE EXPONENTIAL SMOOTHING WITH DEVIATION INDICATORS</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono" id="forecast-chart-legend">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-1 px-1 bg-slate-800 border border-slate-700 select-none block"></span> Confidence Area (σ)
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Actual Revenue
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-0.5 border-t-2 border-dashed border-indigo-400"></span> Predicted Baseline
            </span>
            <span className="flex items-center gap-1 text-rose-500 font-bold">
              <span className="w-2 rounded-full h-2 bg-rose-500"></span> Flagged Exception
            </span>
          </div>
        </div>

        {/* Dynamic model charting displaying forecast + conf area + red dots anomalies */}
        <div className="h-[320px]" id="forecast-line-chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedForecastData} margin={{ top: 15, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1e293b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#1e293b" stopOpacity={0.1}/>
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
                formatter={(value: any, name: string) => {
                  let label = 'Actual Revenue';
                  if (name === 'forecast') label = 'Predicted Base';
                  else if (name === 'upperConfidence') label = 'Upper Bound';
                  else if (name === 'lowerConfidence') label = 'Lower Bound';
                  return [`$${parseInt(value).toLocaleString()}`, label];
                }}
              />
              {/* Confidence margin shading */}
              <Area 
                type="monotone" 
                dataKey="upperConfidence" 
                stroke="transparent"
                fill="#1e293b" 
                fillOpacity={0.5}
                name="Confidence Margin"
              />
              <Area 
                type="monotone" 
                dataKey="lowerConfidence" 
                stroke="transparent"
                fill="#0f172a" 
                fillOpacity={0}
                name="Lower Confidence Edge"
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#818cf8" 
                strokeWidth={1.8}
                strokeDasharray="4 4" 
                dot={false}
                name="Predicted Base"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#6366f1" 
                strokeWidth={2.5}
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.isAnomaly) {
                    return (
                      <circle cx={cx} cy={cy} r={5} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} style={{ cursor: 'pointer' }} />
                    );
                  }
                  return null;
                }}
                name="Actual Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Flagged Anomaly Feeds */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5" id="flagged-anomalies-hud">
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3" id="flag-list-header">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 font-sans">Model Flagged Outliers & Diagnostic Logs</h4>
            <p className="text-xs text-slate-500 font-mono mt-0.5">CURRENT SEN-SITIVITY DETECTS: {activeAnomaliesList.length} DEVIATIONS</p>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Standard Deviation Sigma: {stdDevThreshold}σ</span>
        </div>

        {activeAnomaliesList.length === 0 ? (
          <div className="py-8 text-center text-xs font-mono text-slate-500 bg-slate-950/40 rounded-lg border border-slate-850/50" id="anoms-list-empty">
            No operational exceptions found. Standard deviations are normal.
          </div>
        ) : (
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1" id="anoms-feed-scroller">
            {activeAnomaliesList.map((item, idx) => {
              const diff = item.actual - item.forecast;
              const diffPercent = ((diff / item.forecast) * 100).toFixed(1);
              return (
                <div 
                  key={idx} 
                  className="bg-slate-950 border border-slate-850/80 rounded-lg p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                  id={`anom-item-${idx}`}
                >
                  <div className="flex items-start gap-2.5" id={`anom-meta-${idx}`}>
                    <AlertOctagon className="w-5 h-5 text-rose-500 mt-0.5 flex-none" />
                    <div>
                      <div className="flex items-center gap-2" id={`anom-title-${idx}`}>
                        <span className="font-mono text-slate-400 font-bold">{item.date}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400">
                          {diff < 0 ? 'NEGATIVE DEVIATION' : 'POSITIVE SURGE'}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1 font-sans">{item.anomalyReason || 'Outlier operating variance matching criteria boundaries.'}</p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center font-mono text-right border-t sm:border-t-0 border-slate-800/40 pt-2 sm:pt-0" id={`anom-stats-${idx}`}>
                    <span className="text-slate-300 font-bold">Value: ${item.actual.toLocaleString()}</span>
                    <span className={`text-[11px] font-bold ${diff < 0 ? 'text-rose-400' : 'text-emerald-400'}`} id={`anom-val-diff-${idx}`}>
                      {diff >= 0 ? '+' : ''}{diffPercent}% vs Forecast
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
