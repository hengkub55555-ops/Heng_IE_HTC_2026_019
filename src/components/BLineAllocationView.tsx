import React, { useState } from 'react';
import { CalculationResult } from '../utils/calculator';
import {
  BLineIndirectRole,
  BLineShiftSettings,
  CalculationSettings,
  LineSegment,
  ManualOverrides,
} from '../types/manpower';
import {
  Users,
  ShieldCheck,
  Clock,
  Gauge,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  Briefcase,
  Calendar,
  Info,
  Check,
  Edit2,
  Download,
} from 'lucide-react';

interface BLineAllocationViewProps {
  result: CalculationResult;
  lineSegments: LineSegment[];
  settings: CalculationSettings;
  indirectRoles: BLineIndirectRole[];
  shiftSettings: BLineShiftSettings;
  manualOverrides: ManualOverrides;
  onUpdateManpower: (segmentId: string, week: string, value: number) => void;
  onUpdateAvgManpower: (segmentId: string, value: number) => void;
  onUpdateSegmentName: (segmentId: string, name: string, thaiName: string) => void;
  onUpdateUph: (segmentId: string, value: number) => void;
  onResetSegmentManpower: (segmentId: string) => void;
  onResetAllManpowerOverrides: () => void;
  onUpdateIndirectRole: (roleId: string, field: string, value: any) => void;
  onAddIndirectRole: () => void;
  onDeleteIndirectRole: (roleId: string) => void;
  onUpdateShiftSettings: (newSettings: Partial<BLineShiftSettings>) => void;
  onSaveData: () => void;
  onExportExcel: () => void;
}

export const BLineAllocationView: React.FC<BLineAllocationViewProps> = ({
  result,
  lineSegments,
  settings,
  indirectRoles,
  shiftSettings,
  manualOverrides,
  onUpdateManpower,
  onUpdateAvgManpower,
  onUpdateSegmentName,
  onUpdateUph,
  onResetSegmentManpower,
  onResetAllManpowerOverrides,
  onUpdateIndirectRole,
  onAddIndirectRole,
  onDeleteIndirectRole,
  onUpdateShiftSettings,
  onSaveData,
  onExportExcel,
}) => {
  const { weeks, area, workshop, monthName } = settings;
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'direct' | 'indirect' | 'shift_specs'>('all');
  const [isEditMode, setIsEditMode] = useState(true);

  // Group line segments into pre-foaming (7) and assembly-final (5)
  const preFoamingSegments = lineSegments.filter((s) => s.sectionId === 'pre_foaming');
  const assemblyFinalSegments = lineSegments.filter((s) => s.sectionId === 'assembly_final');

  // Direct Labor totals across all 12 lines
  const dlTotals = result.totals.manpower;
  const dlAvg = result.totals.avgManpower;

  // Indirect Labor totals
  const idlTotals: Record<string, number> = {};
  weeks.forEach((w) => {
    idlTotals[w] = indirectRoles.reduce((acc, r) => acc + (r.headcount[w] || 0), 0);
  });
  const idlAvg = Math.round(
    indirectRoles.reduce((acc, r) => acc + (r.avgHeadcount || 0), 0)
  );

  // Grand Total (Direct + Indirect)
  const grandTotalManpower: Record<string, number> = {};
  weeks.forEach((w) => {
    grandTotalManpower[w] = (dlTotals[w] || 0) + (idlTotals[w] || 0);
  });
  const grandTotalAvg = dlAvg + idlAvg;

  // Section subtotals
  const getSectionTotals = (segments: LineSegment[]) => {
    const sectionMp: Record<string, number> = {};
    weeks.forEach((w) => {
      sectionMp[w] = segments.reduce((acc, seg) => {
        const sum = result.summaries.find((s) => s.lineSegment.id === seg.id);
        return acc + (sum?.manpower[w] || 0);
      }, 0);
    });
    const sectionAvg = segments.reduce((acc, seg) => {
      const sum = result.summaries.find((s) => s.lineSegment.id === seg.id);
      return acc + (sum?.avgManpower || 0);
    }, 0);
    return { sectionMp, sectionAvg };
  };

  const preFoamingTotals = getSectionTotals(preFoamingSegments);
  const assemblyFinalTotals = getSectionTotals(assemblyFinalSegments);

  return (
    <div className="space-y-6">
      {/* Top Banner & Title Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
              {area} · {workshop}
            </span>
            <span>·</span>
            <span>{monthName}</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ตารางจัดสรรกำลังคนและข้อมูลอื่นๆ ของ B-line (Line B Workforce Allocation)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            รายงานแผนจัดสรรอัตรากำลังพลฝ่ายผลิต Line B ครบทั้งแรงงานทางตรง (DL 12 สาย) แรงงานทางอ้อม (IDL) การจัดกะ และพารามิเตอร์สายการผลิต
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isEditMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isEditMode ? <Check className="w-3.5 h-3.5 text-amber-700" /> : <Edit2 className="w-3.5 h-3.5 text-slate-500" />}
            <span>{isEditMode ? 'โหมดแก้ไขตัวเลข (เปิดอยู่)' : 'เปิดโหมดแก้ไข'}</span>
          </button>

          <button
            onClick={onSaveData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกข้อมูล</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Direct Labor (DL) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-700">แรงงานทางตรง (Direct Labor - DL)</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-900 font-mono">{dlAvg}</span>
            <span className="text-xs text-slate-500">คนเฉลี่ย (12 สายผลิต)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>1W: {dlTotals['1W']}</span>
            <span>2W: {dlTotals['2W']}</span>
            <span>3W: {dlTotals['3W']}</span>
            <span>4W: {dlTotals['4W']}</span>
          </div>
        </div>

        {/* Card 2: Indirect Labor (IDL) */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-700">แรงงานทางอ้อม (Indirect Labor - IDL)</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-900 font-mono">{idlAvg}</span>
            <span className="text-xs text-slate-500">คนเฉลี่ย (หัวหน้า, QC, คิตติ้ง, ช่าง)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>1W: {idlTotals['1W']}</span>
            <span>2W: {idlTotals['2W']}</span>
            <span>3W: {idlTotals['3W']}</span>
            <span>4W: {idlTotals['4W']}</span>
          </div>
        </div>

        {/* Card 3: Total Headcount */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-4.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-indigo-200 text-xs">
            <span className="font-semibold text-white">รวมกำลังคนทั้งสิ้น Line B (Total)</span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{grandTotalAvg}</span>
            <span className="text-xs text-indigo-200">คนเฉลี่ย (DL + IDL)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200 font-mono">
            <span>1W: {grandTotalManpower['1W']}</span>
            <span>2W: {grandTotalManpower['2W']}</span>
            <span>3W: {grandTotalManpower['3W']}</span>
            <span>4W: {grandTotalManpower['4W']}</span>
          </div>
        </div>

        {/* Card 4: Shift & Takt Time */}
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-700">การจัดกะ & Takt Time</span>
            <Gauge className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-900 font-mono">
              {shiftSettings.activeShifts === 1 ? '1 กะ + OT' : '2 กะปกติ'}
            </span>
            <span className="text-xs text-slate-500">({shiftSettings.workDaysPerWeek} วัน/สัปดาห์)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Takt 120 UPH: <strong>30s</strong></span>
            <span>Takt 70 UPH: <strong>51.4s</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'ภาพรวมทั้งหมด (Complete View)', icon: Layers },
          { id: 'direct', label: 'แรงงานทางตรง 12 สาย (Direct Labor - DL)', icon: Users },
          { id: 'indirect', label: 'แรงงานทางอ้อม & สนับสนุน (Indirect Labor - IDL)', icon: ShieldCheck },
          { id: 'shift_specs', label: 'แผนกะ & สเปกข้อมูล Line B (Shift & Specs)', icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === tab.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: DIRECT LABOR (DL) ALLOCATION TABLE */}
      {(activeSubTab === 'all' || activeSubTab === 'direct') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span>1. ตารางจัดสรรกำลังคนฝ่ายผลิต Line B (Direct Labor Allocation - 12 สายการผลิต)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดสรรอัตรากำลังพลหน้าสายการผลิตแยกตามแผนกขึ้นรูป & โฟม (7 สาย) และแผนกประกอบ & ท้ายไลน์ (5 สาย)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('คุณต้องการคืนค่ากำลังคนของ Line B ทั้งหมดกลับเป็นสูตร IE ใช่หรือไม่?')) {
                    onResetAllManpowerOverrides();
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>คืนสูตร IE ทั้งหมด</span>
              </button>
              <div className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-lg border border-blue-300">
                รวม DL: {dlAvg} คน
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 w-10 text-center">#</th>
                  <th className="px-4 py-2.5 min-w-[200px]">สายการผลิต (Line Segment)</th>
                  <th className="px-3 py-2.5 text-center min-w-[75px]">UPH</th>
                  <th className="px-3 py-2.5 text-center min-w-[85px]">Takt Time</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">1W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">2W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">3W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">4W (คน)</th>
                  <th className="px-4 py-2.5 text-center bg-amber-300 text-amber-950 font-bold border-l border-amber-400 min-w-[90px]">
                    AVG (เฉลี่ย)
                  </th>
                  <th className="px-3 py-2.5 text-right min-w-[85px]">สัดส่วน</th>
                  <th className="px-3 py-2.5 text-center min-w-[95px]">สถานะ / คืนค่า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums font-mono text-slate-800">
                {/* SECTION A: PRE-FOAMING (7 Lines) */}
                <tr className="bg-blue-50/60 font-sans font-bold text-blue-950 text-xs">
                  <td colSpan={11} className="px-4 py-2">
                    หมวดที่ 1: ขึ้นรูป, กล่องใน & ฉีดโฟม (Pre-Assembly & Foaming - 7 สายการผลิต)
                  </td>
                </tr>
                {preFoamingSegments.map((segment, idx) => {
                  const summary = result.summaries.find((s) => s.lineSegment.id === segment.id);
                  const avgSeg = summary?.avgManpower ?? 0;
                  const sharePercent = ((Number(avgSeg) / (Number(dlAvg) || 1)) * 100).toFixed(1);
                  const taktTime = segment.uph > 0 ? (3600 / segment.uph).toFixed(1) : '-';

                  const hasSegmentOverride =
                    (manualOverrides?.manpower?.[segment.id] &&
                      Object.keys(manualOverrides.manpower[segment.id]).length > 0) ||
                    manualOverrides?.avg?.[segment.id] !== undefined;

                  return (
                    <tr key={segment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-400 font-sans">{idx + 1}</td>
                      <td className="px-4 py-2 font-sans font-medium text-slate-900">
                        {isEditMode ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={segment.name}
                              onChange={(e) => onUpdateSegmentName(segment.id, e.target.value, segment.thaiName)}
                              className="w-full px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={segment.thaiName}
                              onChange={(e) => onUpdateSegmentName(segment.id, segment.name, e.target.value)}
                              className="w-full px-1.5 py-0.5 text-[10px] text-slate-500 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold">{segment.name}</div>
                            <div className="text-[10px] text-slate-500">{segment.thaiName}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-amber-700">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={segment.uph}
                            onChange={(e) => onUpdateUph(segment.id, parseInt(e.target.value, 10) || 0)}
                            className="w-14 px-1 py-0.5 text-center text-xs font-bold bg-amber-50 border border-amber-300 rounded focus:bg-white focus:outline-hidden"
                          />
                        ) : (
                          <span>{segment.uph}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500 text-[11px]">{taktTime}s</td>
                      {weeks.map((w) => {
                        const mpVal = summary?.manpower[w] ?? 0;
                        const isWeekOverridden = manualOverrides?.manpower?.[segment.id]?.[w] !== undefined;
                        return (
                          <td key={w} className="px-3 py-2 text-right">
                            {isEditMode ? (
                              <input
                                type="number"
                                value={mpVal}
                                onChange={(e) => onUpdateManpower(segment.id, w, parseInt(e.target.value, 10) || 0)}
                                className={`w-14 px-1 py-0.5 text-right text-xs font-mono font-bold rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                                  isWeekOverridden
                                    ? 'bg-amber-100 border-2 border-amber-500 text-amber-950'
                                    : 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                                }`}
                              />
                            ) : (
                              <span className="font-bold text-slate-800">{mpVal}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2 text-center font-extrabold text-amber-950 bg-amber-100/70 border-l border-amber-300">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={avgSeg}
                            onChange={(e) => onUpdateAvgManpower(segment.id, parseInt(e.target.value, 10) || 0)}
                            className={`w-14 px-1 py-0.5 text-center text-xs font-mono font-extrabold rounded focus:bg-white focus:outline-hidden ${
                              manualOverrides?.avg?.[segment.id] !== undefined
                                ? 'bg-amber-300 border-2 border-amber-600 text-amber-950'
                                : 'bg-amber-200 border border-amber-400 text-amber-950'
                            }`}
                          />
                        ) : (
                          <span className="font-extrabold">{avgSeg}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">{sharePercent}%</td>
                      <td className="px-3 py-2 text-center font-sans">
                        {hasSegmentOverride ? (
                          <button
                            type="button"
                            onClick={() => onResetSegmentManpower(segment.id)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>คืนสูตร</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                            <span>สูตร IE</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {/* Section A Subtotal */}
                <tr className="bg-blue-100/40 font-bold text-blue-900 text-xs border-t border-b">
                  <td colSpan={4} className="px-4 py-2 font-sans">
                    รวมหมวดที่ 1 (Subtotal Pre-Assembly & Foaming)
                  </td>
                  {weeks.map((w) => (
                    <td key={`sub-a-${w}`} className="px-3 py-2 text-right">
                      {preFoamingTotals.sectionMp[w]}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center text-amber-950 bg-amber-200/80 border-l border-amber-300 font-extrabold">
                    {preFoamingTotals.sectionAvg}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {((preFoamingTotals.sectionAvg / (dlAvg || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-center text-slate-400">/</td>
                </tr>

                {/* SECTION B: ASSEMBLY & FINAL (5 Lines) */}
                <tr className="bg-purple-50/60 font-sans font-bold text-purple-950 text-xs">
                  <td colSpan={11} className="px-4 py-2">
                    หมวดที่ 2: ประกอบวงจร, ระบบความเย็น & ท้ายไลน์ (Assembly & Final - 5 สายการผลิต)
                  </td>
                </tr>
                {assemblyFinalSegments.map((segment, idx) => {
                  const summary = result.summaries.find((s) => s.lineSegment.id === segment.id);
                  const avgSeg = summary?.avgManpower ?? 0;
                  const sharePercent = ((Number(avgSeg) / (Number(dlAvg) || 1)) * 100).toFixed(1);
                  const taktTime = segment.uph > 0 ? (3600 / segment.uph).toFixed(1) : '-';

                  const hasSegmentOverride =
                    (manualOverrides?.manpower?.[segment.id] &&
                      Object.keys(manualOverrides.manpower[segment.id]).length > 0) ||
                    manualOverrides?.avg?.[segment.id] !== undefined;

                  return (
                    <tr key={segment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-center text-slate-400 font-sans">{idx + 8}</td>
                      <td className="px-4 py-2 font-sans font-medium text-slate-900">
                        {isEditMode ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={segment.name}
                              onChange={(e) => onUpdateSegmentName(segment.id, e.target.value, segment.thaiName)}
                              className="w-full px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={segment.thaiName}
                              onChange={(e) => onUpdateSegmentName(segment.id, segment.name, e.target.value)}
                              className="w-full px-1.5 py-0.5 text-[10px] text-slate-500 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold">{segment.name}</div>
                            <div className="text-[10px] text-slate-500">{segment.thaiName}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-bold text-amber-700">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={segment.uph}
                            onChange={(e) => onUpdateUph(segment.id, parseInt(e.target.value, 10) || 0)}
                            className="w-14 px-1 py-0.5 text-center text-xs font-bold bg-amber-50 border border-amber-300 rounded focus:bg-white focus:outline-hidden"
                          />
                        ) : (
                          <span>{segment.uph}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-slate-500 text-[11px]">{taktTime}s</td>
                      {weeks.map((w) => {
                        const mpVal = summary?.manpower[w] ?? 0;
                        const isWeekOverridden = manualOverrides?.manpower?.[segment.id]?.[w] !== undefined;
                        return (
                          <td key={w} className="px-3 py-2 text-right">
                            {isEditMode ? (
                              <input
                                type="number"
                                value={mpVal}
                                onChange={(e) => onUpdateManpower(segment.id, w, parseInt(e.target.value, 10) || 0)}
                                className={`w-14 px-1 py-0.5 text-right text-xs font-mono font-bold rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                                  isWeekOverridden
                                    ? 'bg-amber-100 border-2 border-amber-500 text-amber-950'
                                    : 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                                }`}
                              />
                            ) : (
                              <span className="font-bold text-slate-800">{mpVal}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2 text-center font-extrabold text-amber-950 bg-amber-100/70 border-l border-amber-300">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={avgSeg}
                            onChange={(e) => onUpdateAvgManpower(segment.id, parseInt(e.target.value, 10) || 0)}
                            className={`w-14 px-1 py-0.5 text-center text-xs font-mono font-extrabold rounded focus:bg-white focus:outline-hidden ${
                              manualOverrides?.avg?.[segment.id] !== undefined
                                ? 'bg-amber-300 border-2 border-amber-600 text-amber-950'
                                : 'bg-amber-200 border border-amber-400 text-amber-950'
                            }`}
                          />
                        ) : (
                          <span className="font-extrabold">{avgSeg}</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">{sharePercent}%</td>
                      <td className="px-3 py-2 text-center font-sans">
                        {hasSegmentOverride ? (
                          <button
                            type="button"
                            onClick={() => onResetSegmentManpower(segment.id)}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>คืนสูตร</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1 py-0.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                            <span>สูตร IE</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {/* Section B Subtotal */}
                <tr className="bg-purple-100/40 font-bold text-purple-900 text-xs border-t border-b">
                  <td colSpan={4} className="px-4 py-2 font-sans">
                    รวมหมวดที่ 2 (Subtotal Assembly & Final Line)
                  </td>
                  {weeks.map((w) => (
                    <td key={`sub-b-${w}`} className="px-3 py-2 text-right">
                      {assemblyFinalTotals.sectionMp[w]}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center text-amber-950 bg-amber-200/80 border-l border-amber-300 font-extrabold">
                    {assemblyFinalTotals.sectionAvg}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {((assemblyFinalTotals.sectionAvg / (dlAvg || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-center text-slate-400">/</td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-xs">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-sans uppercase">
                    รวมแรงงานทางตรง Line B (Total Direct Labor - 12 สาย)
                  </td>
                  {weeks.map((w) => (
                    <td key={`dl-foot-${w}`} className="px-3 py-3 text-right text-emerald-300 font-mono text-sm">
                      {dlTotals[w]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-amber-950 font-mono text-sm bg-amber-400 border-l border-amber-500 font-extrabold">
                    {dlAvg}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-300 font-mono">100.0%</td>
                  <td className="px-3 py-3 text-center text-slate-400 font-mono text-[11px]">/</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: INDIRECT LABOR (IDL) & SUPPORT ROLES TABLE */}
      {(activeSubTab === 'all' || activeSubTab === 'indirect') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. ตารางจัดสรรกำลังคนทางอ้อมและสายสนับสนุน Line B (Indirect Labor & Support Roles)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                พนักงานสนับสนุนการผลิต ได้แก่ หัวหน้าสาย, พนักงาน QC, พนักงานส่งจ่ายวัตถุดิบ (Mizusumashi), ช่างเทคนิค และพนักงานสำรอง
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAddIndirectRole}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มตำแหน่งงานสนับสนุน</span>
              </button>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-950 text-xs font-bold rounded-lg border border-emerald-300">
                รวม IDL: {idlAvg} คน
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-2.5 w-10 text-center">#</th>
                  <th className="px-4 py-2.5 min-w-[200px]">ตำแหน่งงาน (Role Name)</th>
                  <th className="px-3 py-2.5 min-w-[140px]">กะทำงาน (Shift Plan)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">1W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">2W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">3W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">4W (คน)</th>
                  <th className="px-4 py-2.5 text-center bg-amber-300 text-amber-950 font-bold border-l border-amber-400 min-w-[90px]">
                    AVG (เฉลี่ย)
                  </th>
                  <th className="px-4 py-2.5 min-w-[220px]">หน้าที่รับผิดชอบหลัก (Key Responsibilities)</th>
                  <th className="px-3 py-2.5 text-center w-12">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums font-mono text-slate-800">
                {indirectRoles.map((role, idx) => (
                  <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-2 text-center text-slate-400 font-sans">{idx + 1}</td>
                    <td className="px-4 py-2 font-sans font-medium text-slate-900">
                      {isEditMode ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={role.roleName}
                            onChange={(e) => onUpdateIndirectRole(role.id, 'roleName', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                          />
                          <input
                            type="text"
                            value={role.roleThaiName}
                            onChange={(e) => onUpdateIndirectRole(role.id, 'roleThaiName', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-[10px] text-slate-500 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold">{role.roleName}</div>
                          <div className="text-[10px] text-slate-500">{role.roleThaiName}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 font-sans text-slate-600">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={role.shift}
                          onChange={(e) => onUpdateIndirectRole(role.id, 'shift', e.target.value)}
                          className="w-full px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
                        />
                      ) : (
                        <span>{role.shift}</span>
                      )}
                    </td>
                    {weeks.map((w) => (
                      <td key={`idl-${role.id}-${w}`} className="px-3 py-2 text-right">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={role.headcount[w] || 0}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              const nextHc = { ...role.headcount, [w]: val };
                              const nextAvg = Math.round(
                                weeks.reduce((sum, wk) => sum + (nextHc[wk] || 0), 0) / weeks.length
                              );
                              onUpdateIndirectRole(role.id, 'headcount', nextHc);
                              onUpdateIndirectRole(role.id, 'avgHeadcount', nextAvg);
                            }}
                            className="w-14 px-1 py-0.5 text-right text-xs font-mono font-bold bg-emerald-50 border border-emerald-300 rounded focus:bg-white focus:outline-hidden"
                          />
                        ) : (
                          <span className="font-bold text-slate-800">{role.headcount[w] || 0}</span>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center font-extrabold text-amber-950 bg-amber-100/70 border-l border-amber-300">
                      {isEditMode ? (
                        <input
                          type="number"
                          value={role.avgHeadcount}
                          onChange={(e) =>
                            onUpdateIndirectRole(role.id, 'avgHeadcount', Math.max(0, parseInt(e.target.value, 10) || 0))
                          }
                          className="w-14 px-1 py-0.5 text-center text-xs font-mono font-extrabold bg-amber-200 border border-amber-400 rounded focus:bg-white focus:outline-hidden text-amber-950"
                        />
                      ) : (
                        <span className="font-extrabold">{role.avgHeadcount}</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-sans text-slate-600 text-[11px]">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={role.responsibilities}
                          onChange={(e) => onUpdateIndirectRole(role.id, 'responsibilities', e.target.value)}
                          className="w-full px-1.5 py-0.5 text-[11px] bg-white border border-slate-300 rounded focus:outline-hidden"
                        />
                      ) : (
                        <span>{role.responsibilities}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center font-sans">
                      <button
                        type="button"
                        onClick={() => onDeleteIndirectRole(role.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="ลบตำแหน่งนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-xs">
                <tr>
                  <td colSpan={3} className="px-4 py-3 font-sans uppercase">
                    รวมแรงงานทางอ้อม Line B (Total Indirect Labor - IDL)
                  </td>
                  {weeks.map((w) => (
                    <td key={`idl-foot-${w}`} className="px-3 py-3 text-right text-emerald-300 font-mono text-sm">
                      {idlTotals[w]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-amber-950 font-mono text-sm bg-amber-400 border-l border-amber-500 font-extrabold">
                    {idlAvg}
                  </td>
                  <td colSpan={2} className="px-4 py-3 text-slate-300 font-sans font-normal text-[11px]">
                    สนับสนุนการทำงานของไลน์ B ทุกกะ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: GRAND TOTAL MANPOWER ALLOCATION SUMMARY */}
      {(activeSubTab === 'all' || activeSubTab === 'direct' || activeSubTab === 'indirect') && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>ตารางสรุปจัดสรรกำลังคนรวม Line B (Total Workforce Summary - DL + IDL)</span>
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                รวมอัตรากำลังพลทั้งสิ้น (แรงงานทางตรง 12 สาย + แรงงานทางอ้อมและสนับสนุน)
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-indigo-300">อัตราส่วน DL / IDL: </span>
              <span className="text-sm font-bold text-amber-400">
                {dlAvg} คน ({((dlAvg / (grandTotalAvg || 1)) * 100).toFixed(0)}%) / {idlAvg} คน ({((idlAvg / (grandTotalAvg || 1)) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-indigo-200 uppercase tracking-wider text-[11px] border-b border-white/10">
                <tr>
                  <th className="px-4 py-2">หมวดกำลังคน (Labor Category)</th>
                  <th className="px-3 py-2 text-right">1W (คน)</th>
                  <th className="px-3 py-2 text-right">2W (คน)</th>
                  <th className="px-3 py-2 text-right">3W (คน)</th>
                  <th className="px-3 py-2 text-right">4W (คน)</th>
                  <th className="px-4 py-2 text-center text-amber-400 font-bold min-w-[90px]">AVG (เฉลี่ย)</th>
                  <th className="px-4 py-2 text-right">สัดส่วน (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-mono text-sm">
                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>แรงงานทางตรง 12 สายการผลิต (Direct Labor - DL)</span>
                  </td>
                  {weeks.map((w) => (
                    <td key={`dl-row-${w}`} className="px-3 py-2.5 text-right text-blue-200 font-bold">
                      {dlTotals[w]}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center text-amber-300 font-extrabold">{dlAvg}</td>
                  <td className="px-4 py-2.5 text-right text-indigo-200">
                    {((dlAvg / (grandTotalAvg || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr>
                  <td className="px-4 py-2.5 font-sans font-medium text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span>แรงงานทางอ้อมและสายสนับสนุน (Indirect Labor - IDL)</span>
                  </td>
                  {weeks.map((w) => (
                    <td key={`idl-row-${w}`} className="px-3 py-2.5 text-right text-emerald-300 font-bold">
                      {idlTotals[w]}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center text-amber-300 font-extrabold">{idlAvg}</td>
                  <td className="px-4 py-2.5 text-right text-indigo-200">
                    {((idlAvg / (grandTotalAvg || 1)) * 100).toFixed(1)}%
                  </td>
                </tr>

                <tr className="bg-white/10 font-bold text-white text-base">
                  <td className="px-4 py-3 font-sans uppercase text-amber-400">
                    ยอดรวมอัตรากำลังพลทั้งสิ้น Line B (Grand Total Headcount)
                  </td>
                  {weeks.map((w) => (
                    <td key={`gt-row-${w}`} className="px-3 py-3 text-right text-amber-300 font-extrabold">
                      {grandTotalManpower[w]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center text-amber-400 bg-amber-500/20 font-black border-l border-white/20">
                    {grandTotalAvg}
                  </td>
                  <td className="px-4 py-3 text-right text-white">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: SHIFT PLANNING & LINE B SPECIFICATIONS */}
      {(activeSubTab === 'all' || activeSubTab === 'shift_specs') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Shift Schedule Box */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  การจัดกะทำงานและชั่วโมงการผลิตของ Line B (Shift Schedule Model)
                </h3>
                <p className="text-xs text-slate-500">
                  ปรับตั้งค่าชั่วโมงการทำงานและจำนวนกะเพื่อคำนวณกำลังคนต่อกะ
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-slate-500 font-medium mb-1">จำนวนกะการทำงาน (Active Shifts)</label>
                  <select
                    value={shiftSettings.activeShifts}
                    onChange={(e) => onUpdateShiftSettings({ activeShifts: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 font-bold text-slate-900 focus:outline-hidden"
                  >
                    <option value={1}>1 กะปกติ (Day Shift + OT)</option>
                    <option value={2}>2 กะหมุนเวียน (Day & Night Shift)</option>
                  </select>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-slate-500 font-medium mb-1">วันทำงานต่อสัปดาห์ (Days/Week)</label>
                  <input
                    type="number"
                    value={shiftSettings.workDaysPerWeek}
                    onChange={(e) => onUpdateShiftSettings({ workDaysPerWeek: parseInt(e.target.value, 10) || 6 })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-slate-500 font-medium mb-1">ชั่วโมงทำงาน/กะ</label>
                  <input
                    type="number"
                    value={shiftSettings.dayShiftHours}
                    onChange={(e) => onUpdateShiftSettings({ dayShiftHours: parseFloat(e.target.value) || 8 })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-slate-500 font-medium mb-1">เวลาทำงานจริง (นาที)</label>
                  <input
                    type="number"
                    value={shiftSettings.dayShiftEffectiveMinutes}
                    onChange={(e) =>
                      onUpdateShiftSettings({ dayShiftEffectiveMinutes: parseInt(e.target.value, 10) || 420 })
                    }
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                  />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <label className="block text-slate-500 font-medium mb-1">OT เฉลี่ย (ชม./วัน)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={shiftSettings.otHoursPerDay}
                    onChange={(e) => onUpdateShiftSettings({ otHoursPerDay: parseFloat(e.target.value) || 2.5 })}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 space-y-1.5">
                <div className="font-bold flex items-center justify-between text-xs">
                  <span>กำลังคนต่อกะการทำงาน (Staffing per Shift):</span>
                  <span className="text-sm font-extrabold text-blue-950 font-mono">
                    {Math.ceil(grandTotalAvg / shiftSettings.activeShifts)} คน / กะ
                  </span>
                </div>
                <p className="text-[11px] text-blue-700">
                  {shiftSettings.activeShifts === 1
                    ? 'ดำเนินงาน 1 กะหลัก โดยใช้การต่อกะ OT 2.5 ชม. ในช่วงเร่งยอด 2W–4W'
                    : 'แบ่งกำลังคนออกเป็น 2 กะเท่ากัน (กะเช้า / กะดึก) รองรับกำลังผลิตสูง'}
                </p>
              </div>
            </div>
          </div>

          {/* Line B Technical Specifications */}
          <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                <Info className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  ข้อมูลจำเพาะและพารามิเตอร์อื่นๆ ของ B-line (Line B Plant Specs)
                </h3>
                <p className="text-xs text-slate-500">
                  รายละเอียดกระบวนการผลิต ข้อจำกัดทางเทคนิค และจุดคอขวดของสายการผลิตตู้เย็น Line B
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900">ชื่อสายการผลิตและพื้นที่ (Area & Workshop)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Line B CAB (Refrigerator Cabinet Line B)</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-800 rounded">
                  โรงงานประเทศไทย
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">จำนวนสถานีงาน (Workstations)</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5 font-mono">12 สถานีหลัก</div>
                  <div className="text-[10px] text-slate-500">7 สถานีขึ้นรูป & 5 สถานีประกอบ</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-slate-500 text-[11px]">ความเร็วสายผลิตมาตรฐาน (Rated UPH)</div>
                  <div className="text-base font-extrabold text-amber-700 mt-0.5 font-mono">70 - 120 UPH</div>
                  <div className="text-[10px] text-slate-500">ขึ้นรูป 120 UPH / โฟม 70 UPH</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-700" />
                  <span>จุดคอขวดของสายการผลิต (Identified Bottleneck Stations):</span>
                </div>
                <ul className="list-disc list-inside mt-1.5 space-y-1 text-[11px] text-amber-900">
                  <li>
                    <strong>PU Foaming (ฉีดโฟม):</strong> รอบเวลาการบ่มโฟม (Foam Curing Time) 45–60 วินาที ถูกจำกัดด้วยจำนวนจิ๊กฉีดโฟม
                  </li>
                  <li>
                    <strong>Cab Pre-Assembly (ประกอบตัวถัง):</strong> มีเวลางานมาตรฐานสูงถึง 737–922 วินาทีในรุ่น T Door US & FUF
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-800 text-[11px] mb-1">รุ่นผลิตภัณฑ์ที่รองรับบน Line B (Product Mix):</div>
                <div className="flex flex-wrap gap-1.5">
                  {['1Door 150', '1Door 190', 'TM545', 'TM595', 'T Door US', 'TM 10', 'TM 12', 'FUF'].map((m) => (
                    <span key={m} className="px-2 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-semibold text-slate-700">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
