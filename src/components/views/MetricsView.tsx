import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  Server, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  Calendar,
  Layers,
  Zap
} from 'lucide-react';
import { TableSchema, ProjectTask } from '../../types';

interface MetricsViewProps {
  tasks: ProjectTask[];
  table: TableSchema;
}

export const MetricsView: React.FC<MetricsViewProps> = ({ tasks, table }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; label: string; primary: number } | null>(null);

  // Time-series mock data based on range
  const chartData = timeRange === '7d' ? [
    { label: 'Mon', primary: 24, secondary: 18 },
    { label: 'Tue', primary: 38, secondary: 22 },
    { label: 'Wed', primary: 45, secondary: 31 },
    { label: 'Thu', primary: 32, secondary: 28 },
    { label: 'Fri', primary: 56, secondary: 40 },
    { label: 'Sat', primary: 41, secondary: 34 },
    { label: 'Sun', primary: 49, secondary: 39 },
  ] : timeRange === '30d' ? [
    { label: 'W1', primary: 140, secondary: 110 },
    { label: 'W2', primary: 185, secondary: 145 },
    { label: 'W3', primary: 210, secondary: 170 },
    { label: 'W4', primary: 245, secondary: 195 },
  ] : [
    { label: 'Jul', primary: 680, secondary: 520 },
    { label: 'Aug', primary: 820, secondary: 640 },
    { label: 'Sep', primary: 950, secondary: 760 },
  ];

  // SVG dimensions for Area Chart
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 20;

  const maxVal = Math.max(...chartData.map(d => d.primary)) * 1.15;
  const minVal = 0;

  const points = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((d.primary - minVal) / (maxVal - minVal)) * (svgHeight - padding * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`;

  // Secondary line path
  const secPoints = chartData.map((d, i) => {
    const x = padding + (i / (chartData.length - 1)) * (svgWidth - padding * 2);
    const y = svgHeight - padding - ((d.secondary - minVal) / (maxVal - minVal)) * (svgHeight - padding * 2);
    return { x, y };
  });
  const secPathD = secPoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  // Calculate sprint task completion rates
  const donePoints = tasks.filter(t => t.status === 'done').reduce((acc, t) => acc + t.estimatePoints, 0);
  const totalPoints = tasks.reduce((acc, t) => acc + t.estimatePoints, 0) || 1;
  const velocityRate = Math.round((donePoints / totalPoints) * 100);

  // Group services by status
  const activeCount = table.rows.filter(r => r.status === 'Active').length;
  const degradedCount = table.rows.filter(r => r.status === 'Degraded').length;
  const stagedCount = table.rows.filter(r => r.status === 'Staged').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Telemetry & Operational Metrics</h1>
          <p className="text-xs text-neutral-400 mt-0.5">High-frequency service metrics, SLA uptime, and sprint throughput</p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800 text-xs self-start">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded-md transition-colors ${
              timeRange === '7d' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded-md transition-colors ${
              timeRange === '30d' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setTimeRange('90d')}
            className={`px-3 py-1 rounded-md transition-colors ${
              timeRange === '90d' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* KPI Cards (Tabular Numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Overall Availability SLA</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            99.982%
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+0.04% vs prior 30d period</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Query Latency p95</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            38.4 ms
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <span>Target threshold &lt; 50ms</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Sprint Burn-Down Velocity</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {donePoints} / {totalPoints} pts
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
            <span>{velocityRate}% capacity delivered</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Active Worker Replicas</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-white font-mono tabular-nums">
            {table.rows.reduce((sum, r) => sum + (Number(r.replicas) || 0), 0)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-cyan-400">
            <span>Across 6 production clusters</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Area Chart: Request Volume */}
        <div className="lg:col-span-2 rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">Platform Ingestion Throughput</h2>
              <p className="text-xs text-neutral-400">Average thousand requests per second vs baseline</p>
            </div>
            {hoveredPoint && (
              <div className="font-mono text-xs text-indigo-400 bg-neutral-950 px-2 py-1 rounded border border-neutral-800 tabular-nums">
                {hoveredPoint.label}: {hoveredPoint.primary}k req/s
              </div>
            )}
          </div>

          {/* SVG Area Chart */}
          <div className="w-full overflow-hidden">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#262626" strokeDasharray="3 3" />
              <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#262626" strokeDasharray="3 3" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#333333" />

              {/* Area fill */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Secondary baseline line */}
              <path d={secPathD} fill="none" stroke="#525252" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Primary metric line */}
              <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" />

              {/* Interactive Points */}
              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ index: idx, label: p.label, primary: p.primary })}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.index === idx ? 5 : 3.5}
                    fill={hoveredPoint?.index === idx ? "#ffffff" : "#6366f1"}
                    stroke="#1e1b4b"
                    strokeWidth="2"
                    className="transition-all duration-150"
                  />
                  <text
                    x={p.x}
                    y={svgHeight - 4}
                    textAnchor="middle"
                    fill="#737373"
                    className="text-[10px] font-mono select-none"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
                <span>Actual Ingestion Rate</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-neutral-500 rounded-sm" />
                <span>Estimated Baseline</span>
              </span>
            </div>
            <span className="font-mono text-[11px] tabular-nums">Sample resolution 1m</span>
          </div>
        </div>

        {/* Right Column: Service Health Breakdown */}
        <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-5 space-y-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Cluster Service Status</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Deployment health categorization</p>

            <div className="mt-6 space-y-4">
              {/* Active */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300">Active & Nominal</span>
                  <span className="font-mono tabular-nums text-emerald-400 font-semibold">{activeCount} services</span>
                </div>
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(activeCount / (table.rows.length || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Staged */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300">Staged (Pre-production)</span>
                  <span className="font-mono tabular-nums text-amber-400 font-semibold">{stagedCount} services</span>
                </div>
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500" 
                    style={{ width: `${(stagedCount / (table.rows.length || 1)) * 100}%` }} 
                  />
                </div>
              </div>

              {/* Degraded */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-300">Degraded / Failover</span>
                  <span className="font-mono tabular-nums text-rose-400 font-semibold">{degradedCount} services</span>
                </div>
                <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500" 
                    style={{ width: `${(degradedCount / (table.rows.length || 1)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800/80 text-[11px] text-neutral-400 space-y-1">
            <div className="font-medium text-neutral-300">Auto-Healing Status: Active</div>
            <p>Kubernetes ingress probes cycling every 15s. Degraded replicas quarantined automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
