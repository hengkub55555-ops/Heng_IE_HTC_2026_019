import React from 'react';
import { CalculationResult } from '../utils/calculator';
import { CalculationSettings } from '../types/manpower';
import { Users, TrendingUp, Layers, Gauge } from 'lucide-react';

interface MetricCardsProps {
  result: CalculationResult;
  settings: CalculationSettings;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ result, settings }) => {
  const { weeks } = settings;
  const totalUnits = result.totalMonthlyUnits;

  const weeklyManpower = weeks.map((w) => result.totals.manpower[w] || 0);
  const peakManpower = Math.max(...weeklyManpower);
  const peakWeek = weeks[weeklyManpower.indexOf(peakManpower)] || '3W';
  const avgManpower = Math.round(weeklyManpower.reduce((a, b) => a + b, 0) / (weeklyManpower.length || 1));

  // Find line with largest headcount in peak week
  const peakSegment = result.summaries.reduce(
    (max, s) => {
      const mp = s.manpower[peakWeek] || 0;
      return mp > max.mp ? { name: s.lineSegment.name, mp } : max;
    },
    { name: '', mp: 0 }
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Peak Manpower */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">กำลังพลสูงสุด (Peak Headcount)</span>
          <Users className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {peakManpower}
          </span>
          <span className="text-sm font-medium text-slate-600">คน (สัปดาห์ {peakWeek})</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>สัปดาห์ 1W: {result.totals.manpower['1W']} คน</span>
          <span aria-hidden="true">·</span>
          <span>สัปดาห์ 4W: {result.totals.manpower['4W']} คน</span>
        </div>
      </div>

      {/* Card 2: Average Monthly Headcount */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">กำลังพลเฉลี่ยรายเดือน (Avg Headcount)</span>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {avgManpower}
          </span>
          <span className="text-sm font-medium text-slate-600">คน / สัปดาห์</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>ประสิทธิภาพ OEE: {(settings.efficiency * 100).toFixed(0)}%</span>
          <span aria-hidden="true">·</span>
          <span>ฐานปริมาณ: {settings.baseVolume.toLocaleString()} ชิ้น</span>
        </div>
      </div>

      {/* Card 3: Total Monthly Production Units */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">ยอดคำสั่งผลิตรวม (Monthly Output)</span>
          <Layers className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalUnits.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-slate-600">ชิ้น (Units)</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span>8 รุ่นผลิตภัณฑ์</span>
          <span aria-hidden="true">·</span>
          <span>5 สายการผลิต (Line Segments)</span>
        </div>
      </div>

      {/* Card 4: Bottleneck / Largest Demand Segment */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs transition-shadow hover:shadow-sm">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-medium uppercase tracking-wider">จุดคอขวดแรงงาน (Workforce Bottleneck)</span>
          <Gauge className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900 truncate">
            {peakSegment.name}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
          <span className="font-semibold text-slate-700">{peakSegment.mp} คนใน {peakWeek}</span>
          <span aria-hidden="true">·</span>
          <span>{((peakSegment.mp / peakManpower) * 100).toFixed(0)}% ของแรงงานรวม</span>
        </div>
      </div>
    </div>
  );
};
