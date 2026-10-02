import React, { useState } from 'react';
import { CalculationResult } from '../utils/calculator';
import { CalculationSettings, LineSegment, PlantSectionId } from '../types/manpower';
import { PLANT_SECTIONS } from '../data/initialData';
import { BarChart3, PieChart, Activity, TrendingUp, Layers } from 'lucide-react';

interface ManpowerChartsProps {
  result: CalculationResult;
  lineSegments: LineSegment[];
  settings: CalculationSettings;
  onChangeSection: (sectionId: PlantSectionId) => void;
}

const SEGMENT_COLORS: Record<string, { bg: string; fill: string; stroke: string; label: string }> = {
  // Pre-foaming
  rooling: { bg: 'bg-blue-600', fill: '#2563eb', stroke: '#1d4ed8', label: 'Rooling' },
  inner_box_1: { bg: 'bg-indigo-600', fill: '#4f46e5', stroke: '#4338ca', label: 'Inner Box 1' },
  inner_box_2: { bg: 'bg-violet-500', fill: '#8b5cf6', stroke: '#7c3aed', label: 'Inner Box 2' },
  cab_per_1: { bg: 'bg-teal-600', fill: '#0d9488', stroke: '#0f766e', label: 'Cab per1' },
  cab_per_2: { bg: 'bg-emerald-600', fill: '#059669', stroke: '#047857', label: 'Cab per2' },
  pu_foam_1: { bg: 'bg-amber-500', fill: '#f59e0b', stroke: '#d97706', label: 'PU Foam1' },
  pu_foam_2: { bg: 'bg-orange-500', fill: '#f97316', stroke: '#ea580c', label: 'PU Foam2' },

  // Assembly & final
  system: { bg: 'bg-blue-500', fill: '#3b82f6', stroke: '#2563eb', label: 'System' },
  assembly: { bg: 'bg-purple-600', fill: '#9333ea', stroke: '#7e22ce', label: 'Assembly & Door' },
  cooling: { bg: 'bg-cyan-500', fill: '#06b6d4', stroke: '#0891b2', label: 'Cooling' },
  final: { bg: 'bg-green-600', fill: '#16a34a', stroke: '#15803d', label: 'Final' },
  packing: { bg: 'bg-yellow-500', fill: '#eab308', stroke: '#ca8a04', label: 'Packing' },
};

export const ManpowerCharts: React.FC<ManpowerChartsProps> = ({
  result,
  lineSegments,
  settings,
  onChangeSection,
}) => {
  const { weeks, activeSectionId } = settings;
  const [activeWeek, setActiveWeek] = useState<string>('3W');
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Stacked Bar Heights
  const maxWeeklyTotal = Math.max(...weeks.map((w) => result.totals.manpower[w] || 0), 30);

  // Weekly totals
  const weeklyTotals = weeks.map((w) => result.totals.manpower[w]);
  const peakTotal = Math.max(...weeklyTotals);
  const avgTotal = result.totals.avgManpower;

  // Donut data for active week
  const donutData = lineSegments.map((s) => {
    const summary = result.summaries.find((sum) => sum.lineSegment.id === s.id);
    const count = summary?.manpower[activeWeek] || 0;
    const color = SEGMENT_COLORS[s.id] || { fill: '#64748b', stroke: '#475569', label: s.name };
    return {
      id: s.id,
      name: s.name,
      thaiName: s.thaiName,
      count,
      color: color.fill,
    };
  });

  const totalActiveWeekCount = donutData.reduce((acc, d) => acc + d.count, 0) || 1;

  // Calculate SVG arc paths for donut
  let cumulativeAngle = 0;
  const donutArcs = donutData.map((d) => {
    const sliceAngle = (d.count / totalActiveWeekCount) * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle += sliceAngle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const rOuter = 85;
    const rInner = 52;
    const cx = 110;
    const cy = 110;

    const x1 = cx + rOuter * Math.cos(startRad);
    const y1 = cy + rOuter * Math.sin(startRad);
    const x2 = cx + rOuter * Math.cos(endRad);
    const y2 = cy + rOuter * Math.sin(endRad);

    const x3 = cx + rInner * Math.cos(endRad);
    const y3 = cy + rInner * Math.sin(endRad);
    const x4 = cx + rInner * Math.cos(startRad);
    const y4 = cy + rInner * Math.sin(startRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = sliceAngle >= 359.9
      ? `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 1 1 ${cx - 0.01} ${cy - rOuter} Z`
      : `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    const percent = ((d.count / totalActiveWeekCount) * 100).toFixed(1);

    return {
      ...d,
      percent,
      pathData,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Section Tabs and Week Selector */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>รายงานวิเคราะห์และสรุปผลอัตรากำลังพล (Workforce Analytics)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปข้อมูลเปรียบเทียบกำลังคน UPH และค่าเฉลี่ย AVG ในแต่ละสัปดาห์
          </p>
        </div>

        {/* Section Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {PLANT_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => onChangeSection(sec.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeSectionId === sec.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec.name}
              </button>
            ))}
          </div>

          {/* Week Selector Tab */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <span className="text-xs text-slate-500 px-2 font-medium">สัปดาห์:</span>
            {weeks.map((w) => (
              <button
                key={w}
                onClick={() => setActiveWeek(w)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeWeek === w
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {w} ({result.totals.manpower[w]} คน)
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Stacked Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>ความต้องการกำลังคนรายสัปดาห์ (Weekly Manpower by Segment)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  สถิติกำลังคนที่ต้องจัดสรรแยกตาม 1W, 2W, 3W, 4W ในหมวดนี้
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">เฉลี่ยรวม (AVG Total)</span>
                <div className="text-base font-bold text-amber-600 tabular-nums">{avgTotal} คน</div>
              </div>
            </div>

            {/* SVG Stacked Bar Visual */}
            <div className="relative pt-6 pb-2">
              <div className="h-64 flex items-end justify-around gap-6 sm:gap-10 border-b border-slate-200 px-4">
                {weeks.map((w) => {
                  const total = result.totals.manpower[w] || 0;
                  const barHeightPercent = (total / maxWeeklyTotal) * 100;

                  return (
                    <div
                      key={w}
                      className="flex-1 flex flex-col items-center max-w-[80px] group cursor-pointer"
                      onClick={() => setActiveWeek(w)}
                    >
                      {/* Total Headcount Label above bar */}
                      <span className="text-xs font-bold text-slate-900 mb-1.5 tabular-nums">
                        {total} คน
                      </span>

                      {/* Stacked bar container */}
                      <div
                        style={{ height: `${barHeightPercent}%` }}
                        className={`w-full rounded-t-md overflow-hidden flex flex-col-reverse shadow-xs transition-transform duration-200 ${
                          activeWeek === w ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:opacity-90'
                        }`}
                      >
                        {lineSegments.map((segment) => {
                          const summary = result.summaries.find((s) => s.lineSegment.id === segment.id);
                          const count = summary?.manpower[w] || 0;
                          const segmentHeightPercent = total > 0 ? (count / total) * 100 : 0;
                          const color = SEGMENT_COLORS[segment.id] || { fill: '#64748b' };
                          const isHovered = hoveredSegment === segment.id;

                          return (
                            <div
                              key={segment.id}
                              style={{
                                height: `${segmentHeightPercent}%`,
                                backgroundColor: color.fill,
                              }}
                              onMouseEnter={() => setHoveredSegment(segment.id)}
                              onMouseLeave={() => setHoveredSegment(null)}
                              title={`${segment.name}: ${count} คน (${segmentHeightPercent.toFixed(1)}%)`}
                              className={`w-full transition-opacity flex items-center justify-center text-[10px] font-bold text-white ${
                                hoveredSegment && !isHovered ? 'opacity-40' : 'opacity-100'
                              }`}
                            >
                              {count >= 3 && <span>{count}</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Week Label below axis */}
                      <span
                        className={`mt-2 text-xs font-semibold ${
                          activeWeek === w ? 'text-blue-600 font-bold' : 'text-slate-600'
                        }`}
                      >
                        {w}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Y-axis guidelines */}
              <div className="absolute left-0 top-6 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 pointer-events-none tabular-nums">
                <span>{maxWeeklyTotal}</span>
                <span>{Math.round(maxWeeklyTotal * 0.75)}</span>
                <span>{Math.round(maxWeeklyTotal * 0.5)}</span>
                <span>{Math.round(maxWeeklyTotal * 0.25)}</span>
                <span>0</span>
              </div>
            </div>
          </div>

          {/* Interactive Legend */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-xs">
            {lineSegments.map((s) => {
              const color = SEGMENT_COLORS[s.id] || { fill: '#64748b' };
              const isHovered = hoveredSegment === s.id;
              return (
                <button
                  key={s.id}
                  onMouseEnter={() => setHoveredSegment(s.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`flex items-center gap-1.5 transition-opacity ${
                    hoveredSegment && !isHovered ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-xs shrink-0"
                    style={{ backgroundColor: color.fill }}
                  />
                  <span className="text-slate-700 font-medium text-[11px]">{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Donut Chart - Headcount Distribution (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>สัดส่วนกำลังคน ({activeWeek})</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                รวม {totalActiveWeekCount} คน
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              สัดส่วนเปอร์เซ็นต์กำลังคนตามสายการผลิตในสัปดาห์ {activeWeek}
            </p>

            {/* Donut SVG */}
            <div className="flex items-center justify-center relative my-2">
              <svg width="220" height="220" viewBox="0 0 220 220" className="drop-shadow-xs">
                {donutArcs.map((arc) => (
                  <path
                    key={arc.id}
                    d={arc.pathData}
                    fill={arc.color}
                    stroke="#ffffff"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredSegment(arc.id)}
                    onMouseLeave={() => setHoveredSegment(null)}
                    className="cursor-pointer transition-transform duration-200 hover:opacity-90"
                  />
                ))}
                {/* Center text */}
                <circle cx="110" cy="110" r="48" fill="#ffffff" />
                <text
                  x="110"
                  y="106"
                  textAnchor="middle"
                  className="text-2xl font-bold fill-slate-900 font-mono"
                >
                  {totalActiveWeekCount}
                </text>
                <text
                  x="110"
                  y="124"
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-slate-500"
                >
                  คนทั้งหมด ({activeWeek})
                </text>
              </svg>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-1.5 mt-2 pt-2 border-t border-slate-100 max-h-48 overflow-y-auto pr-1">
            {donutArcs.map((d) => (
              <div
                key={d.id}
                onMouseEnter={() => setHoveredSegment(d.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`flex items-center justify-between text-xs py-1 px-1.5 rounded transition-colors ${
                  hoveredSegment === d.id ? 'bg-slate-50 font-semibold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="truncate max-w-[140px] text-[11px]">{d.name}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="font-bold text-slate-900">{d.count} คน</span>
                  <span className="text-slate-400 text-[10px] w-10 text-right">{d.percent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 3: Weekly Output vs Headcount Cards */}
        <div className="lg:col-span-12 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>เปรียบเทียบยอดการผลิตกับจำนวนกำลังคน (Production Volume vs. Manpower)</span>
              </h3>
              <p className="text-xs text-slate-500">
                ความต้องการบุคลากรในแต่ละสัปดาห์ตามยอดสั่งผลิตจริง (ชิ้น)
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-200 border border-blue-400 rounded-xs" />
                <span>ยอดสั่งผลิต (Units)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1.5 bg-emerald-600 rounded-full" />
                <span>กำลังคนมาตรฐาน (Headcount)</span>
              </div>
            </div>
          </div>

          {/* Comparison Cards per Week */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {weeks.map((w) => {
              const units = result.weeklyUniqueUnits[w] || 0;
              const mp = result.totals.manpower[w] || 0;
              const unitsPerPerson = mp > 0 ? Math.round(units / mp) : 0;
              const isPeak = mp === peakTotal;

              return (
                <div
                  key={w}
                  className={`p-4 rounded-xl border transition-all ${
                    isPeak
                      ? 'border-emerald-300 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-slate-900">{w}</span>
                    {isPeak && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Peak Demand
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">ยอดผลิต (Production):</span>
                      <span className="font-bold text-slate-900 tabular-nums">
                        {units.toLocaleString()} ชิ้น
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">กำลังคน (Headcount):</span>
                      <span className="font-bold text-emerald-700 tabular-nums text-sm">
                        {mp} คน
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <span className="text-slate-500">ผลิตภาพต่อคน:</span>
                      <span className="font-semibold text-slate-700 tabular-nums">
                        {unitsPerPerson.toLocaleString()} ชิ้น/คน
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Segment Details & AVG Table */}
        <div className="lg:col-span-12 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                ตารางสรุปจัดสรรกำลังคนและค่าเฉลี่ย AVG ตามสายการผลิต
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                แสดง UPH, กำลังคนแต่ละสัปดาห์, และค่าเฉลี่ย AVG ตามเอกสารอ้างอิง
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-300">
              รวม AVG: {result.totals.avgManpower} คน
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">สายการผลิต (Line Segment)</th>
                  <th className="px-3 py-3 text-center">UPH</th>
                  <th className="px-3 py-3 text-right">1W (คน)</th>
                  <th className="px-3 py-3 text-right">2W (คน)</th>
                  <th className="px-3 py-3 text-right">3W (คน)</th>
                  <th className="px-3 py-3 text-right">4W (คน)</th>
                  <th className="px-4 py-3 text-center bg-amber-300 text-amber-950 font-bold border-l border-amber-400">
                    AVG (เฉลี่ย)
                  </th>
                  <th className="px-4 py-3 text-right">สัดส่วนในหมวด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums font-mono text-slate-800">
                {lineSegments.map((segment) => {
                  const summary = result.summaries.find((s) => s.lineSegment.id === segment.id);
                  const color = SEGMENT_COLORS[segment.id] || { fill: '#64748b' };
                  const counts = weeks.map((w) => summary?.manpower[w] || 0);
                  const avgSeg = summary?.avgManpower ?? 0;
                  const sharePercent = ((Number(avgSeg) / (Number(avgTotal) || 1)) * 100).toFixed(1);

                  return (
                    <tr key={segment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-sans font-medium text-slate-900 flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: color.fill }} />
                        <div>
                          <div className="font-bold">{segment.name}</div>
                          <div className="text-[10px] text-slate-500 font-normal">{segment.thaiName}</div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-amber-700">
                        {segment.uph}
                      </td>
                      {weeks.map((w) => (
                        <td key={w} className="px-3 py-3 text-right font-semibold text-slate-800">
                          {summary?.manpower[w] ?? 0}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-center font-extrabold text-amber-950 bg-amber-100/70 border-l border-amber-300">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-amber-200 text-amber-950">
                          {avgSeg}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-600">
                        {sharePercent}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-xs">
                <tr>
                  <td className="px-4 py-3 font-sans uppercase">รวมอัตรากำลังพล (Total Manpower)</td>
                  <td className="px-3 py-3 text-center text-amber-300">
                    {result.totals.uph['1W']}
                  </td>
                  {weeks.map((w) => (
                    <td key={w} className="px-3 py-3 text-right text-emerald-300 text-sm">
                      {result.totals.manpower[w]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-amber-950 text-sm bg-amber-400 border-l border-amber-500 font-extrabold">
                    {result.totals.avgManpower}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-300">
                    100.0%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
