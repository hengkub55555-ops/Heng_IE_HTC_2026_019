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

interface ALineAllocationViewProps {
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

export const ALineAllocationView: React.FC<ALineAllocationViewProps> = ({
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

  // Group line segments into pre-foaming (5) and assembly-final (5) for Line A
  const preFoamingSegments = lineSegments.filter((s) => s.sectionId === 'pre_foaming');
  const assemblyFinalSegments = lineSegments.filter((s) => s.sectionId === 'assembly_final');

  // Direct Labor totals across all 10 lines
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
            <span>·</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              High Volume 2 Shifts (2 กะหมุนเวียน)
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>ตารางจัดสรรกำลังคนและข้อมูลอื่นๆ ของ A-line (Line A Workforce Allocation)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            รายงานแผนจัดสรรอัตรากำลังพลฝ่ายผลิต Line A ครบทั้งแรงงานทางตรง (DL 10 สาย) แรงงานทางอ้อม (IDL) การจัดกะ 2 กะ และพารามิเตอร์สายการผลิต
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
            <span className="text-xs text-slate-500">คนเฉลี่ย (10 สายผลิต)</span>
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
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-4.5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-indigo-200 text-xs">
            <span className="font-semibold text-white">รวมกำลังคนทั้งสิ้น Line A (Total)</span>
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
            <span className="font-semibold text-slate-700">การจัดกะ & Takt Time Line A</span>
            <Gauge className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-900 font-mono">
              {shiftSettings.activeShifts} กะหมุนเวียน
            </span>
            <span className="text-xs text-slate-500">({shiftSettings.workDaysPerWeek} วัน/สัปดาห์)</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>Takt 120 UPH: <strong>30.0s</strong></span>
            <span>Takt 80 UPH: <strong>45.0s</strong></span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all', label: 'ภาพรวมทั้งหมด (Complete View)', icon: Layers },
          { id: 'direct', label: 'แรงงานทางตรง 10 สาย (Direct Labor - DL)', icon: Users },
          { id: 'indirect', label: 'แรงงานทางอ้อม & สนับสนุน (Indirect Labor - IDL)', icon: ShieldCheck },
          { id: 'shift_specs', label: 'แผนกะ & สเปกข้อมูล Line A (Shift & Specs)', icon: Calendar },
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
                <span>1. ตารางจัดสรรกำลังคนฝ่ายผลิต Line A (Direct Labor Allocation - 10 สายการผลิต)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                จัดสรรอัตรากำลังพลหน้าสายการผลิต Line A แยกตามแผนกขึ้นรูป & โฟม (5 สาย) และแผนกประกอบ & ท้ายไลน์ (5 สาย)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('คุณต้องการคืนค่ากำลังคนของ Line A ทั้งหมดกลับเป็นสูตร IE ใช่หรือไม่?')) {
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
                {/* SECTION A: PRE-FOAMING (5 Lines) */}
                <tr className="bg-blue-50/60 font-sans font-bold text-blue-950 text-xs">
                  <td colSpan={11} className="px-4 py-2">
                    หมวดที่ 1: ขึ้นรูป & ฉีดโฟม Line A (Pre-Assembly & Foaming - 5 สายการผลิต)
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
                    รวมหมวดที่ 1 (Subtotal Pre-Assembly & Foaming Line A)
                  </td>
                  {weeks.map((w) => (
                    <td key={`sub-a-${w}`} className="px-3 py-2 text-right">
                      {preFoamingTotals.sectionMp[w]}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center text-amber-950 bg-amber-200/80 border-l border-amber-300 font-extrabold">
                    {preFoamingTotals.sectionAvg}
                  </td>
                  <td className="px-3 py-2 text-right font-sans">
                    {((preFoamingTotals.sectionAvg / (dlAvg || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-center font-sans text-slate-400">-</td>
                </tr>

                {/* SECTION B: ASSEMBLY & FINAL (5 Lines) */}
                <tr className="bg-indigo-50/60 font-sans font-bold text-indigo-950 text-xs">
                  <td colSpan={11} className="px-4 py-2">
                    หมวดที่ 2: ประกอบ & ท้ายไลน์ Line A (Assembly & Final - 5 สายการผลิต)
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
                      <td className="px-3 py-2 text-center text-slate-400 font-sans">
                        {preFoamingSegments.length + idx + 1}
                      </td>
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
                <tr className="bg-indigo-100/40 font-bold text-indigo-900 text-xs border-t border-b">
                  <td colSpan={4} className="px-4 py-2 font-sans">
                    รวมหมวดที่ 2 (Subtotal Assembly & Final Line A)
                  </td>
                  {weeks.map((w) => (
                    <td key={`sub-b-${w}`} className="px-3 py-2 text-right">
                      {assemblyFinalTotals.sectionMp[w]}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center text-amber-950 bg-amber-200/80 border-l border-amber-300 font-extrabold">
                    {assemblyFinalTotals.sectionAvg}
                  </td>
                  <td className="px-3 py-2 text-right font-sans">
                    {((assemblyFinalTotals.sectionAvg / (dlAvg || 1)) * 100).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2 text-center font-sans text-slate-400">-</td>
                </tr>
              </tbody>
              {/* Grand Total Direct Labor */}
              <tfoot className="bg-slate-900 text-white font-mono font-bold text-xs">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-sans font-extrabold text-sm">
                    รวมกำลังคนทางตรงทั้งสิ้น Line A (DL Total - 10 สายการผลิต)
                  </td>
                  {weeks.map((w) => (
                    <td key={`dl-total-${w}`} className="px-3 py-3 text-right text-emerald-300 text-sm">
                      {dlTotals[w]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center bg-amber-400 text-slate-950 font-black text-base border-l border-amber-500">
                    {dlAvg}
                  </td>
                  <td className="px-3 py-3 text-right font-sans text-emerald-300">100.0%</td>
                  <td className="px-3 py-3 text-center font-sans text-slate-400">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: INDIRECT LABOR (IDL) ALLOCATION TABLE */}
      {(activeSubTab === 'all' || activeSubTab === 'indirect') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>2. ตารางจัดสรรกำลังคนทางอ้อมและสนับสนุน Line A (Indirect Labor Allocation - IDL)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                อัตรากำลังพลสนับสนุนสายการผลิต Line A เช่น หัวหน้าไลน์, QC/QA, จ่ายวัตถุดิบ (Water Spider), ซ่อมบำรุง และพนักงานสำรอง
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAddIndirectRole}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มตำแหน่งงาน IDL</span>
              </button>
              <div className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-lg border border-emerald-300">
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
                  <th className="px-3 py-2.5 text-center min-w-[110px]">หมวดหมู่</th>
                  <th className="px-3 py-2.5 text-center min-w-[110px]">กะการทำงาน</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">1W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">2W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">3W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[75px]">4W (คน)</th>
                  <th className="px-4 py-2.5 text-center bg-amber-300 text-amber-950 font-bold border-l border-amber-400 min-w-[90px]">
                    AVG (เฉลี่ย)
                  </th>
                  <th className="px-4 py-2.5 min-w-[220px]">หน้าที่รับผิดชอบใน Line A</th>
                  {isEditMode && <th className="px-3 py-2.5 text-center w-16">ลบ</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums font-mono text-slate-800">
                {indirectRoles.map((role, idx) => {
                  const getCategoryBadge = (cat: string) => {
                    switch (cat) {
                      case 'supervision':
                        return <span className="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-sans font-semibold">กำกับดูแล</span>;
                      case 'quality':
                        return <span className="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-sans font-semibold">คุณภาพ QC</span>;
                      case 'logistics':
                        return <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-sans font-semibold">ส่งวัตถุดิบ</span>;
                      case 'technical':
                        return <span className="px-2 py-0.5 rounded text-[10px] bg-orange-100 text-orange-800 font-sans font-semibold">ซ่อมบำรุง</span>;
                      default:
                        return <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 font-sans font-semibold">หมุนเวียน/ซัพพอร์ต</span>;
                    }
                  };

                  return (
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
                      <td className="px-3 py-2 text-center font-sans">
                        {isEditMode ? (
                          <select
                            value={role.category}
                            onChange={(e) => onUpdateIndirectRole(role.id, 'category', e.target.value)}
                            className="text-[10px] px-1 py-0.5 bg-white border border-slate-300 rounded focus:outline-hidden"
                          >
                            <option value="supervision">กำกับดูแล</option>
                            <option value="quality">คุณภาพ QC</option>
                            <option value="logistics">ส่งวัตถุดิบ</option>
                            <option value="technical">ซ่อมบำรุง</option>
                            <option value="support">หมุนเวียน/ซัพพอร์ต</option>
                          </select>
                        ) : (
                          getCategoryBadge(role.category)
                        )}
                      </td>
                      <td className="px-3 py-2 text-center font-sans text-slate-600 text-xs">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={role.shift}
                            onChange={(e) => onUpdateIndirectRole(role.id, 'shift', e.target.value)}
                            className="w-24 px-1 py-0.5 text-center text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
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
                                const nextVal = parseInt(e.target.value, 10) || 0;
                                const nextHc = { ...role.headcount, [w]: nextVal };
                                onUpdateIndirectRole(role.id, 'headcount', nextHc);
                                const newAvg = Math.round(
                                  weeks.reduce((acc, wk) => acc + (nextHc[wk] || 0), 0) / weeks.length
                                );
                                onUpdateIndirectRole(role.id, 'avgHeadcount', newAvg);
                              }}
                              className="w-14 px-1 py-0.5 text-right text-xs font-mono font-bold bg-emerald-50 border border-emerald-300 rounded focus:bg-white focus:outline-hidden"
                            />
                          ) : (
                            <span className="font-bold">{role.headcount[w] || 0}</span>
                          )}
                        </td>
                      ))}
                      <td className="px-4 py-2 text-center font-extrabold text-amber-950 bg-amber-100/70 border-l border-amber-300">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={role.avgHeadcount}
                            onChange={(e) =>
                              onUpdateIndirectRole(role.id, 'avgHeadcount', parseInt(e.target.value, 10) || 0)
                            }
                            className="w-14 px-1 py-0.5 text-center text-xs font-mono font-extrabold bg-amber-200 border border-amber-400 rounded focus:bg-white focus:outline-hidden"
                          />
                        ) : (
                          <span className="font-extrabold">{role.avgHeadcount}</span>
                        )}
                      </td>
                      <td className="px-4 py-2 font-sans text-slate-600 text-xs">
                        {isEditMode ? (
                          <input
                            type="text"
                            value={role.responsibilities}
                            onChange={(e) => onUpdateIndirectRole(role.id, 'responsibilities', e.target.value)}
                            className="w-full px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden"
                          />
                        ) : (
                          <span>{role.responsibilities}</span>
                        )}
                      </td>
                      {isEditMode && (
                        <td className="px-3 py-2 text-center font-sans">
                          <button
                            type="button"
                            onClick={() => onDeleteIndirectRole(role.id)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="ลบตำแหน่งนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-mono font-bold text-xs">
                <tr>
                  <td colSpan={4} className="px-4 py-3 font-sans font-extrabold text-sm">
                    รวมกำลังคนทางอ้อมทั้งสิ้น Line A (IDL Total)
                  </td>
                  {weeks.map((w) => (
                    <td key={`idl-total-${w}`} className="px-3 py-3 text-right text-emerald-300 text-sm">
                      {idlTotals[w]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center bg-amber-400 text-slate-950 font-black text-base border-l border-amber-500">
                    {idlAvg}
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-400" colSpan={isEditMode ? 2 : 1}>
                    ตำแหน่งงานสนับสนุนฝ่ายผลิต Line A ทั้ง 2 กะ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* GRAND TOTAL SUMMARY CARD (DL + IDL) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-blue-200 font-semibold mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-800/80 border border-blue-600">
                สรุปภาพรวมทั้งหมด (Grand Total)
              </span>
              <span>สายการผลิต Line A (High Volume Production)</span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>ยอดรวมอัตรากำลังพลทั้งสิ้น Line A:</span>
              <span className="text-amber-400 font-mono text-2xl font-black">{grandTotalAvg} คน</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              รวมแรงงานทางตรง (DL 10 สาย = {dlAvg} คน) และแรงงานทางอ้อม (IDL = {idlAvg} คน) กระจายครอบคลุม 2 กะการทำงาน
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            {weeks.map((w) => (
              <div key={`gt-card-${w}`} className="bg-white/10 p-2.5 rounded-xl border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-blue-200 font-sans">{w}</div>
                <div className="text-lg font-black text-amber-300">{grandTotalManpower[w]}</div>
                <div className="text-[9px] text-slate-400 font-sans">
                  DL {dlTotals[w]} + IDL {idlTotals[w]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: SHIFT & PLANT SPECS FOR LINE A */}
      {(activeSubTab === 'all' || activeSubTab === 'shift_specs') && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
          <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>3. ข้อมูลการจัดกะและพารามิเตอร์สายการผลิต Line A (Shift & Production Parameters)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                กำหนดชั่วโมงการทำงาน เวลาผลิตจริง (Effective Time) จำนวนกะ และคำนวณ Takt Time ตาม UPH
              </p>
            </div>
            {isEditMode && (
              <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold self-start sm:self-auto">
                สามารถแก้ไขค่าตัวเลขพารามิเตอร์ด้านล่างได้
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Shift hours & Effective time */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>เวลาทำงานและการจัดกะ (Working Hours)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">จำนวนกะการทำงาน (Shifts):</span>
                  {isEditMode ? (
                    <select
                      value={shiftSettings.activeShifts}
                      onChange={(e) => onUpdateShiftSettings({ activeShifts: parseInt(e.target.value, 10) || 1 })}
                      className="px-2 py-0.5 text-xs font-bold bg-white border border-slate-300 rounded font-mono"
                    >
                      <option value={1}>1 กะปกติ</option>
                      <option value={2}>2 กะหมุนเวียน (กะเช้า & กะดึก)</option>
                    </select>
                  ) : (
                    <strong className="font-mono">{shiftSettings.activeShifts} กะ</strong>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">เวลาทำงานปกติต่อกะ:</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={shiftSettings.dayShiftHours}
                      onChange={(e) => onUpdateShiftSettings({ dayShiftHours: parseFloat(e.target.value) || 8 })}
                      className="w-16 px-1.5 py-0.5 text-right text-xs font-bold bg-white border border-slate-300 rounded font-mono"
                    />
                  ) : (
                    <strong className="font-mono">{shiftSettings.dayShiftHours} ชม./กะ</strong>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">เวลาทำงานจริงที่มีประสิทธิภาพ:</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={shiftSettings.dayShiftEffectiveMinutes}
                      onChange={(e) =>
                        onUpdateShiftSettings({ dayShiftEffectiveMinutes: parseInt(e.target.value, 10) || 430 })
                      }
                      className="w-16 px-1.5 py-0.5 text-right text-xs font-bold bg-white border border-slate-300 rounded font-mono"
                    />
                  ) : (
                    <strong className="font-mono">{shiftSettings.dayShiftEffectiveMinutes} นาที/กะ</strong>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">ชั่วโมงทำงานล่วงเวลา (OT):</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      step="0.5"
                      value={shiftSettings.otHoursPerDay}
                      onChange={(e) => onUpdateShiftSettings({ otHoursPerDay: parseFloat(e.target.value) || 0 })}
                      className="w-16 px-1.5 py-0.5 text-right text-xs font-bold bg-white border border-slate-300 rounded font-mono"
                    />
                  ) : (
                    <strong className="font-mono">{shiftSettings.otHoursPerDay} ชม./วัน</strong>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-800">
                  <span>จัดสรรคนต่อกะ (Headcount/Shift):</span>
                  <span className="font-mono text-blue-700">
                    ~{Math.ceil(grandTotalAvg / (shiftSettings.activeShifts || 1))} คน/กะ
                  </span>
                </div>
              </div>
            </div>

            {/* Work days & monthly capacity */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>วันทำงานและปฏิทินฝ่ายผลิต Line A</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">วันทำงานต่อสัปดาห์:</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={shiftSettings.workDaysPerWeek}
                      onChange={(e) => onUpdateShiftSettings({ workDaysPerWeek: parseInt(e.target.value, 10) || 6 })}
                      className="w-16 px-1.5 py-0.5 text-right text-xs font-bold bg-white border border-slate-300 rounded font-mono"
                    />
                  ) : (
                    <strong className="font-mono">{shiftSettings.workDaysPerWeek} วัน/สัปดาห์</strong>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">วันทำงานในเดือน (9月份):</span>
                  {isEditMode ? (
                    <input
                      type="number"
                      value={shiftSettings.workDaysPerMonth}
                      onChange={(e) => onUpdateShiftSettings({ workDaysPerMonth: parseInt(e.target.value, 10) || 26 })}
                      className="w-16 px-1.5 py-0.5 text-right text-xs font-bold bg-white border border-slate-300 rounded font-mono"
                    />
                  ) : (
                    <strong className="font-mono">{shiftSettings.workDaysPerMonth} วัน/เดือน</strong>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">ยอดฐานการผลิตมาตรฐาน (Base Vol):</span>
                  <strong className="font-mono">{settings.baseVolume.toLocaleString()} ชิ้น</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">ประสิทธิภาพมาตรฐานสายผลิต:</span>
                  <strong className="font-mono">{(settings.efficiency * 100).toFixed(0)}% OEE</strong>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-800">
                  <span>กำลังผลิตรวม 2 กะต่อวัน:</span>
                  <span className="font-mono text-emerald-700">~1,100 - 1,200 ชิ้น/วัน</span>
                </div>
              </div>
            </div>

            {/* Line Speeds & Bottlenecks */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-purple-600" />
                <span>ความเร็วสายผลิต & คอขวด (Bottlenecks)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">สายรีดขึ้นรูป & ท่อวงจร (High Speed):</span>
                  <strong className="font-mono text-blue-700">120 UPH (Takt 30s)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">สายฉีดโฟมประตู (Door Pre & Foam):</span>
                  <strong className="font-mono text-indigo-700">90 UPH (Takt 40s)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">สายกล่องใน, โฟม & ท้ายไลน์:</span>
                  <strong className="font-mono text-amber-700">80 UPH (Takt 45s)</strong>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                  <strong>จุดคอขวดหลัก (Critical Stations):</strong> PU Foam Line A และ Vacuum Station เนื่องจากมีเวลาบ่มโฟม (Foam Curing Time) และเวลาดูดแวคคั่มขั้นต่ำ
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
