import React from 'react';
import { CalculationResult } from '../utils/calculator';
import {
  BLineIndirectRole,
  BLineShiftSettings,
  CalculationSettings,
  LineSegment,
} from '../types/manpower';
import {
  Layers,
  Users,
  ShieldCheck,
  TrendingUp,
  Gauge,
  Clock,
  ArrowRight,
  Download,
  Building2,
  CheckCircle2,
} from 'lucide-react';

interface LineComparisonViewProps {
  resultA: CalculationResult;
  resultB: CalculationResult;
  segmentsA: LineSegment[];
  segmentsB: LineSegment[];
  settingsA: CalculationSettings;
  settingsB: CalculationSettings;
  indirectRolesA: BLineIndirectRole[];
  indirectRolesB: BLineIndirectRole[];
  shiftSettingsA: BLineShiftSettings;
  shiftSettingsB: BLineShiftSettings;
  onSelectLine: (lineId: 'line_a' | 'line_b') => void;
  onExportExcel: () => void;
}

export const LineComparisonView: React.FC<LineComparisonViewProps> = ({
  resultA,
  resultB,
  segmentsA,
  segmentsB,
  settingsA,
  settingsB,
  indirectRolesA,
  indirectRolesB,
  shiftSettingsA,
  shiftSettingsB,
  onSelectLine,
  onExportExcel,
}) => {
  const weeks = ['1W', '2W', '3W', '4W'];

  // Direct Labor
  const dlA = resultA.totals.manpower;
  const dlAvgA = resultA.totals.avgManpower;
  const dlB = resultB.totals.manpower;
  const dlAvgB = resultB.totals.avgManpower;

  // Indirect Labor
  const getIdlTotals = (roles: BLineIndirectRole[]) => {
    const totals: Record<string, number> = {};
    weeks.forEach((w) => {
      totals[w] = roles.reduce((sum, r) => sum + (r.headcount[w] || 0), 0);
    });
    const avg = Math.round(roles.reduce((sum, r) => sum + (r.avgHeadcount || 0), 0));
    return { totals, avg };
  };

  const idlA = getIdlTotals(indirectRolesA);
  const idlB = getIdlTotals(indirectRolesB);

  // Grand Totals per Line
  const gtA: Record<string, number> = {};
  const gtB: Record<string, number> = {};
  const factoryTotal: Record<string, number> = {};

  weeks.forEach((w) => {
    gtA[w] = (dlA[w] || 0) + (idlA.totals[w] || 0);
    gtB[w] = (dlB[w] || 0) + (idlB.totals[w] || 0);
    factoryTotal[w] = gtA[w] + gtB[w];
  });

  const gtAvgA = dlAvgA + idlA.avg;
  const gtAvgB = dlAvgB + idlB.avg;
  const factoryAvgTotal = gtAvgA + gtAvgB;

  // Output Totals
  const outputA = resultA.weeklyUniqueUnits;
  const outputB = resultB.weeklyUniqueUnits;
  const totalMonthOutputA = resultA.totalMonthlyUnits;
  const totalMonthOutputB = resultB.totalMonthlyUnits;
  const factoryMonthOutput = totalMonthOutputA + totalMonthOutputB;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200">
              โรงงานประเทศไทย (Thailand Plant)
            </span>
            <span>·</span>
            <span className="text-slate-600">เปรียบเทียบทั้ง 2 สายการผลิต (Line A & Line B)</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>ระบบเปรียบเทียบและสรุปกำลังคนภาพรวมโรงงาน (Line A vs Line B Comparison)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            สรุปเปรียบเทียบอัตรากำลังพล ผลิตภาพแรงงาน และแผนกะการผลิตระหว่าง Line A (10 สถานีงาน) และ Line B (12 สถานีงาน)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export ทั้งหมดเป็น Excel</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Factory Total Headcount */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-indigo-200 text-xs">
            <span className="font-semibold text-white">รวมกำลังคนทั้งโรงงาน (Factory Total)</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{factoryAvgTotal}</span>
            <span className="text-xs text-indigo-200">คนเฉลี่ย (Line A + Line B)</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
            <span>Line A: <strong className="text-white font-mono">{gtAvgA} คน</strong></span>
            <span>Line B: <strong className="text-white font-mono">{gtAvgB} คน</strong></span>
          </div>
        </div>

        {/* Total Monthly Production */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-700">ยอดผลิตรวมทั้งสิ้น (Factory Output)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {factoryMonthOutput.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">ชิ้น/เดือน (9月份)</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>Line A: {totalMonthOutputA.toLocaleString()}</span>
            <span>Line B: {totalMonthOutputB.toLocaleString()}</span>
          </div>
        </div>

        {/* Productivity Comparison */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-700">ผลิตภาพเฉลี่ย (Productivity)</span>
            <Gauge className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-blue-900 font-mono">
              {Math.round(factoryMonthOutput / (factoryAvgTotal || 1))}
            </span>
            <span className="text-xs text-slate-500">ชิ้น / คน / เดือน</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-mono">
            <span>Line A: {Math.round(totalMonthOutputA / (gtAvgA || 1))}</span>
            <span>Line B: {Math.round(totalMonthOutputB / (gtAvgB || 1))}</span>
          </div>
        </div>

        {/* Workstation & Shifts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-slate-700">ขนาดไลน์และกะทำงาน (Line Scale)</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-900 font-mono">22 สถานี</span>
            <span className="text-xs text-slate-500">รวม 2 สายผลิต</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Line A: 10 สถานี (2 กะ)</span>
            <span>Line B: 12 สถานี (1 กะ)</span>
          </div>
        </div>
      </div>

      {/* Quick Access Line Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Line A Card */}
        <div className="bg-white p-5 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-lg">
                สายการผลิต Line A (A-line)
              </span>
              <span className="text-xs text-slate-500 font-mono">10 สายงาน · 7 รุ่นโมเดล</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              ฝ่ายผลิตตู้เย็น Line A (High Volume Production)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              ผลิตตู้เย็น 1 ประตู (130L, 170L), 2 ประตู (210L, 260L), และรุ่น TM450/500 ความเร็วไลน์ 80–120 UPH
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-mono">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">แรงงานทางตรง</div>
                <div className="font-extrabold text-blue-900 text-sm">{dlAvgA} คน</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">แรงงานทางอ้อม</div>
                <div className="font-extrabold text-emerald-900 text-sm">{idlA.avg} คน</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">รวมกำลังคน Line A</div>
                <div className="font-extrabold text-indigo-900 text-sm">{gtAvgA} คน</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectLine('line_a')}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>เปิดดูตารางคำนวณและข้อมูลจัดสรรคนของ Line A</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Line B Card */}
        <div className="bg-white p-5 rounded-xl border-2 border-indigo-200 hover:border-indigo-400 transition-all shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 text-xs font-bold bg-indigo-100 text-indigo-800 rounded-lg">
                สายการผลิต Line B (B-line)
              </span>
              <span className="text-xs text-slate-500 font-mono">12 สายงาน · 8 รุ่นโมเดล</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">
              ฝ่ายผลิตตู้เย็น Line B CAB (Standard & Export Models)
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              ผลิตตู้เย็น 1Door (150, 190), TM545, TM595, T Door US, TM10, TM12, และ FUF ความเร็วไลน์ 70–120 UPH
            </p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs font-mono">
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">แรงงานทางตรง</div>
                <div className="font-extrabold text-blue-900 text-sm">{dlAvgB} คน</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">แรงงานทางอ้อม</div>
                <div className="font-extrabold text-emerald-900 text-sm">{idlB.avg} คน</div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg text-center">
                <div className="text-slate-400 text-[10px]">รวมกำลังคน Line B</div>
                <div className="font-extrabold text-indigo-900 text-sm">{gtAvgB} คน</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectLine('line_b')}
            className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>เปิดดูตารางคำนวณและข้อมูลจัดสรรคนของ Line B</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comparison Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>ตารางเปรียบเทียบจัดสรรกำลังคนและยอดผลิต Line A vs Line B ตามสัปดาห์</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            สรุปข้อมูลเปรียบเทียบ 1W–4W และค่าเฉลี่ย AVG ของแรงงานทางตรง แรงงานทางอ้อม และยอดการผลิต
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 min-w-[240px]">หมวดหมู่ข้อมูล (Category)</th>
                <th className="px-3 py-3 text-center min-w-[90px]">สายการผลิต</th>
                <th className="px-3 py-3 text-right min-w-[80px]">1W</th>
                <th className="px-3 py-3 text-right min-w-[80px]">2W</th>
                <th className="px-3 py-3 text-right min-w-[80px]">3W</th>
                <th className="px-3 py-3 text-right min-w-[80px]">4W</th>
                <th className="px-4 py-3 text-center bg-amber-300 text-amber-950 font-bold border-l border-amber-400 min-w-[95px]">
                  AVG (เฉลี่ย)
                </th>
                <th className="px-3 py-3 text-right min-w-[80px]">สัดส่วน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 tabular-nums font-mono text-slate-800">
              {/* Direct Labor Rows */}
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-sans font-medium text-slate-900" rowSpan={2}>
                  แรงงานทางตรงหน้าสายการผลิต (Direct Labor - DL)
                </td>
                <td className="px-3 py-2.5 text-center font-sans font-bold text-blue-700 bg-blue-50/50">Line A</td>
                {weeks.map((w) => (
                  <td key={`comp-dl-a-${w}`} className="px-3 py-2.5 text-right font-semibold text-blue-900">
                    {dlA[w]} คน
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-extrabold text-blue-950 bg-blue-100/70 border-l border-blue-200">
                  {dlAvgA} คน
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600">
                  {((dlAvgA / (factoryAvgTotal || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2.5 text-center font-sans font-bold text-indigo-700 bg-indigo-50/50">Line B</td>
                {weeks.map((w) => (
                  <td key={`comp-dl-b-${w}`} className="px-3 py-2.5 text-right font-semibold text-indigo-900">
                    {dlB[w]} คน
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-extrabold text-indigo-950 bg-indigo-100/70 border-l border-indigo-200">
                  {dlAvgB} คน
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600">
                  {((dlAvgB / (factoryAvgTotal || 1)) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Indirect Labor Rows */}
              <tr className="hover:bg-slate-50 bg-slate-50/30">
                <td className="px-4 py-2.5 font-sans font-medium text-slate-900" rowSpan={2}>
                  แรงงานทางอ้อมและสายสนับสนุน (Indirect Labor - IDL)
                </td>
                <td className="px-3 py-2.5 text-center font-sans font-bold text-blue-700 bg-blue-50/50">Line A</td>
                {weeks.map((w) => (
                  <td key={`comp-idl-a-${w}`} className="px-3 py-2.5 text-right text-emerald-800">
                    {idlA.totals[w]} คน
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-bold text-emerald-950 bg-emerald-100/70 border-l border-emerald-200">
                  {idlA.avg} คน
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600">
                  {((idlA.avg / (factoryAvgTotal || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-slate-50 bg-slate-50/30">
                <td className="px-3 py-2.5 text-center font-sans font-bold text-indigo-700 bg-indigo-50/50">Line B</td>
                {weeks.map((w) => (
                  <td key={`comp-idl-b-${w}`} className="px-3 py-2.5 text-right text-emerald-800">
                    {idlB.totals[w]} คน
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-bold text-emerald-950 bg-emerald-100/70 border-l border-emerald-200">
                  {idlB.avg} คน
                </td>
                <td className="px-3 py-2.5 text-right text-slate-600">
                  {((idlB.avg / (factoryAvgTotal || 1)) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Subtotal Line A */}
              <tr className="bg-blue-50 font-bold text-blue-950 border-t border-b">
                <td className="px-4 py-2.5 font-sans">รวมอัตรากำลังพล Line A (DL + IDL)</td>
                <td className="px-3 py-2.5 text-center font-sans">Line A Total</td>
                {weeks.map((w) => (
                  <td key={`comp-tot-a-${w}`} className="px-3 py-2.5 text-right text-blue-950">
                    {gtA[w]} คน
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center text-blue-950 bg-blue-200/80 border-l border-blue-300 font-black">
                  {gtAvgA} คน
                </td>
                <td className="px-3 py-2.5 text-right">
                  {((gtAvgA / (factoryAvgTotal || 1)) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Subtotal Line B */}
              <tr className="bg-indigo-50 font-bold text-indigo-950 border-b">
                <td className="px-4 py-2.5 font-sans">รวมอัตรากำลังพล Line B (DL + IDL)</td>
                <td className="px-3 py-2.5 text-center font-sans">Line B Total</td>
                {weeks.map((w) => (
                  <td key={`comp-tot-b-${w}`} className="px-3 py-2.5 text-right text-indigo-950">
                    {gtB[w]} คน
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center text-indigo-950 bg-indigo-200/80 border-l border-indigo-300 font-black">
                  {gtAvgB} คน
                </td>
                <td className="px-3 py-2.5 text-right">
                  {((gtAvgB / (factoryAvgTotal || 1)) * 100).toFixed(1)}%
                </td>
              </tr>

              {/* Production Volumes */}
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-sans font-medium text-slate-900" rowSpan={2}>
                  ยอดการผลิตตามสัปดาห์ (Weekly Order Units)
                </td>
                <td className="px-3 py-2.5 text-center font-sans font-bold text-blue-700 bg-blue-50/50">Line A</td>
                {weeks.map((w) => (
                  <td key={`comp-ord-a-${w}`} className="px-3 py-2.5 text-right">
                    {outputA[w]?.toLocaleString()}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-bold text-blue-950 bg-blue-100/70 border-l border-blue-200">
                  {totalMonthOutputA.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {((totalMonthOutputA / (factoryMonthOutput || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-3 py-2.5 text-center font-sans font-bold text-indigo-700 bg-indigo-50/50">Line B</td>
                {weeks.map((w) => (
                  <td key={`comp-ord-b-${w}`} className="px-3 py-2.5 text-right">
                    {outputB[w]?.toLocaleString()}
                  </td>
                ))}
                <td className="px-4 py-2.5 text-center font-bold text-indigo-950 bg-indigo-100/70 border-l border-indigo-200">
                  {totalMonthOutputB.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-right">
                  {((totalMonthOutputB / (factoryMonthOutput || 1)) * 100).toFixed(1)}%
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-900 text-white font-bold text-xs">
              <tr>
                <td className="px-4 py-3 font-sans uppercase">
                  ยอดรวมกำลังคนทั้งโรงงาน (Grand Total Factory Headcount)
                </td>
                <td className="px-3 py-3 text-center font-sans text-amber-300">Total Factory</td>
                {weeks.map((w) => (
                  <td key={`comp-foot-${w}`} className="px-3 py-3 text-right text-emerald-300 text-sm">
                    {factoryTotal[w]} คน
                  </td>
                ))}
                <td className="px-4 py-3 text-center text-amber-950 text-sm bg-amber-400 border-l border-amber-500 font-extrabold">
                  {factoryAvgTotal} คน
                </td>
                <td className="px-3 py-3 text-right text-slate-300">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
