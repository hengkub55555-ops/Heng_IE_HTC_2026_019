import React, { useState } from 'react';
import { LineSegment, ProductModel, WeeklyOrders, CalculationSettings } from '../types/manpower';
import { CalculationResult } from '../utils/calculator';
import { Calculator, X, BookOpen, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

interface FormulaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  lineSegments: LineSegment[];
  products: ProductModel[];
  orders: WeeklyOrders;
  settings: CalculationSettings;
}

export const FormulaGuideModal: React.FC<FormulaGuideModalProps> = ({
  isOpen,
  onClose,
  result,
  lineSegments,
  products,
  orders,
  settings,
}) => {
  if (!isOpen) return null;

  const [selectedSegmentId, setSelectedSegmentId] = useState<string>(
    lineSegments[0]?.id || 'rooling'
  );
  const [selectedWeek, setSelectedWeek] = useState<string>('1W');

  const segment = lineSegments.find((s) => s.id === selectedSegmentId) || lineSegments[0];
  const summary = result.summaries.find((s) => s.lineSegment.id === segment?.id);

  const weeklyTotalVol = result.weeklyUniqueUnits[selectedWeek] || 1;
  const uph = segment?.uph || 70;
  const taktTime = (3600 / uph).toFixed(1);
  const efficiency = settings.efficiency;

  // Real step-by-step breakdown
  const weightedHourVal = summary?.weightedHours[selectedWeek] || 0;
  const rawManpowerVal = summary?.rawManpower[selectedWeek] || 0;
  const roundedManpowerVal = summary?.manpower[selectedWeek] || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                สูตรการคิดคำนวณกำลังคนจากเวลามาตรฐาน (Standard Time to Manpower Formulas)
              </h3>
              <p className="text-xs text-slate-500">
                หลักการวิศวกรรมอุตสาหการ (IE) ในการคำนวณอัตรากำลังคนตามภาระงานจริง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 text-xs sm:text-sm">
          {/* Main Formula Card */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4">
            <div className="flex items-center gap-2 text-blue-300 font-semibold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>สูตรคำนวณกำลังคนหลัก (Master Manpower Formula)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formula Box 1 */}
              <div className="bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-xs">
                <div className="text-xs text-blue-200 mb-1 font-medium">สูตร 1: คิดจากเวลาถ่วงน้ำหนักและ UPH</div>
                <div className="text-base sm:text-lg font-mono font-bold text-amber-300 py-1">
                  Manpower = (ST_weighted × UPH) ÷ (3,600 × OEE)
                </div>
                <div className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  นำเวลาทำงานถ่วงน้ำหนัก (วินาที) คูณกับจำนวนเป้าหมายผลิตต่อชั่วโมง (UPH) แล้วหารด้วยเวลาทำงานสุทธิต่อชั่วโมงที่ปรับค่าประสิทธิภาพแล้ว
                </div>
              </div>

              {/* Formula Box 2 */}
              <div className="bg-white/10 p-4 rounded-xl border border-white/15 backdrop-blur-xs">
                <div className="text-xs text-emerald-200 mb-1 font-medium">สูตร 2: คิดจาก Takt Time (รอบเวลาผลิต)</div>
                <div className="text-base sm:text-lg font-mono font-bold text-emerald-300 py-1">
                  Manpower = ST_weighted ÷ (Takt Time × OEE)
                </div>
                <div className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                  โดยที่ <strong>Takt Time = 3,600 วินาที ÷ UPH</strong> คือระยะเวลาปล่อยงาน 1 ชิ้นออกจากสายการผลิต
                </div>
              </div>
            </div>

            {/* Sub-formulas */}
            <div className="p-3.5 bg-black/20 rounded-xl text-xs space-y-2 border border-white/10">
              <div className="font-semibold text-slate-200">สูตรย่อยที่เกี่ยวข้อง:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 text-[11px] font-mono">
                <div>• Share Ratio (%) = (Order Volume_i ÷ Total Volume) × 100</div>
                <div>• ST_weighted (วินาที) = Σ [ Cycle Time_i × Share Ratio_i ]</div>
                <div>• Total Man-Seconds = Σ [ Cycle Time_i × Order Volume_i ]</div>
                <div>• Takt Time = 3,600 ÷ UPH (วินาที/ชิ้น)</div>
              </div>
            </div>
          </div>

          {/* Interactive Live Simulator */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>ตัวจำลองการแทนค่าสูตรจริงตามกระบวนการ (Live Process Calculator)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  เลือกกระบวนการและสัปดาห์เพื่อดูการแทนค่าตัวเลขจริงทีละขั้นตอน
                </p>
              </div>

              {/* Selectors */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedSegmentId}
                  onChange={(e) => setSelectedSegmentId(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  {lineSegments.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.thaiName})
                    </option>
                  ))}
                </select>

                <select
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
                >
                  {settings.weeks.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step-by-Step Breakdown */}
            <div className="space-y-4">
              {/* Step 1: Share Ratio & Cycle Time Table */}
              <div className="space-y-2">
                <div className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">1</span>
                  <span>คำนวณสัดส่วนผลผลิต (Share Ratio) และเวลามาตรฐานถ่วงน้ำหนัก:</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2">รุ่นสินค้า (Model)</th>
                        <th className="px-2.5 py-2 text-right">เวลามาตรฐาน (ST วินาที)</th>
                        <th className="px-2.5 py-2 text-right">ยอดสั่งผลิต ({selectedWeek})</th>
                        <th className="px-2.5 py-2 text-right">ยอดรวมสัปดาห์</th>
                        <th className="px-2.5 py-2 text-right text-blue-700">Share Ratio (%)</th>
                        <th className="px-3 py-2 text-right text-indigo-700">ผลคูณถ่วงน้ำหนัก (ST × Ratio)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono tabular-nums text-slate-700 text-[11px]">
                      {products.map((p) => {
                        const ct = segment?.productCycleTimes[p.id] || 0;
                        const qty = orders[p.id]?.[selectedWeek] || 0;
                        const ratio = weeklyTotalVol > 0 ? (qty / weeklyTotalVol) * 100 : 0;
                        const weighted = ct * (ratio / 100);

                        return (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-3 py-1.5 font-sans font-medium text-slate-900">{p.name}</td>
                            <td className="px-2.5 py-1.5 text-right">{ct.toFixed(2)}</td>
                            <td className="px-2.5 py-1.5 text-right">{qty.toLocaleString()}</td>
                            <td className="px-2.5 py-1.5 text-right text-slate-400">{weeklyTotalVol.toLocaleString()}</td>
                            <td className="px-2.5 py-1.5 text-right font-bold text-blue-600">
                              {ratio.toFixed(2)}%
                            </td>
                            <td className="px-3 py-1.5 text-right font-bold text-indigo-700">
                              {weighted.toFixed(2)} วินาที
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-slate-100 font-mono font-bold text-xs border-t border-slate-200">
                      <tr>
                        <td colSpan={2} className="px-3 py-2 font-sans">รวมยอดของกระบวนการ:</td>
                        <td className="px-2.5 py-2 text-right text-slate-900">
                          {summary?.processTotalOrders[selectedWeek]?.toLocaleString()} ชิ้น
                        </td>
                        <td className="px-2.5 py-2 text-right text-slate-400">-</td>
                        <td className="px-2.5 py-2 text-right text-blue-700">
                          {summary?.processTotalShares[selectedWeek]?.toFixed(2)}%
                        </td>
                        <td className="px-3 py-2 text-right text-indigo-900 text-sm bg-indigo-50">
                          ST_weighted = {weightedHourVal.toFixed(2)} วินาที
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Step 2: Manpower Calculation Formula Substitution */}
              <div className="space-y-2 pt-2">
                <div className="font-semibold text-xs text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[11px] font-bold">2</span>
                  <span>แทนค่าลงในสูตรคำนวณกำลังคน (Substitution into Formula):</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 font-mono">
                  <div className="text-xs text-slate-600">
                    <span className="font-sans font-semibold text-slate-900">พารามิเตอร์ที่นำมาใช้:</span>
                    <span className="ml-2">ST_weighted = <strong>{weightedHourVal.toFixed(2)}</strong> s</span>
                    <span className="mx-2">·</span>
                    <span>UPH = <strong>{uph}</strong></span>
                    <span className="mx-2">·</span>
                    <span>OEE = <strong>{(efficiency * 100).toFixed(0)}%</strong> ({efficiency})</span>
                    <span className="mx-2">·</span>
                    <span>Takt Time = <strong>{taktTime}</strong> s</span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs space-y-1.5 text-amber-950">
                    <div>
                      <strong>สูตร:</strong> Manpower = (ST_weighted × UPH) ÷ (3,600 × OEE)
                    </div>
                    <div>
                      <strong>แทนค่า:</strong> Manpower = ({weightedHourVal.toFixed(2)} × {uph}) ÷ (3,600 × {efficiency})
                    </div>
                    <div>
                      <strong>คำนวณขั้นกลาง:</strong> Manpower = {(weightedHourVal * uph).toFixed(2)} ÷ {(3600 * efficiency).toFixed(0)}
                    </div>
                    <div className="text-sm font-bold text-emerald-800 pt-1 border-t border-amber-200 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-600" />
                      <span>ผลลัพธ์ทศนิยมจริง: <strong>{rawManpowerVal.toFixed(2)} คน</strong></span>
                      <span className="mx-2 text-slate-400">→</span>
                      <span>ปัดเศษตามเกณฑ์: <strong className="text-base text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">{roundedManpowerVal} คน</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Meaning of the Result */}
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">สรุปความหมายในสายการผลิต:</strong> ในกระบวนการ <strong>{segment?.name} ({segment?.thaiName})</strong> ณ สัปดาห์ <strong>{selectedWeek}</strong> ด้วยยอดผลิตและส่วนผสมรุ่นสินค้านี้ สายการผลิตต้องการกำลังคนทำงานจำนวน <strong>{roundedManpowerVal} คน</strong> เพื่อให้ทันรอบเวลาการผลิต UPH = {uph} ชิ้น/ชั่วโมง ภายใต้ระดับประสิทธิภาพ 70%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
          <span className="text-slate-500">
            * สัดส่วน Share Ratio และกำลังคนจะคำนวณอัปเดตแบบอัตโนมัติทันทีที่แก้ไขยอด Order ในตาราง
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            เข้าใจแล้ว / ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
