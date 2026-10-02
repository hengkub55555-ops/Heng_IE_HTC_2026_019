import React, { useState } from 'react';
import { CalculationResult } from '../utils/calculator';
import {
  CalculationSettings,
  LineSegment,
  ManualOverrides,
  PlantSectionId,
  ProductModel,
  WeeklyOrders,
  ShareRatioFormulaMode,
} from '../types/manpower';
import { PLANT_SECTIONS } from '../data/initialData';
import {
  Edit2,
  Check,
  Search,
  Filter,
  RotateCcw,
  Layers,
  Save,
  HelpCircle,
  Percent,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MasterTableProps {
  result: CalculationResult;
  lineSegments: LineSegment[];
  products: ProductModel[];
  orders: WeeklyOrders;
  settings: CalculationSettings;
  manualOverrides?: ManualOverrides;
  onUpdateOrder: (productId: string, week: string, value: number) => void;
  onUpdateCycleTime: (segmentId: string, productId: string, value: number) => void;
  onUpdateUph: (segmentId: string, value: number) => void;
  onUpdateManpower: (segmentId: string, week: string, value: number) => void;
  onUpdateAvgManpower: (segmentId: string, value: number) => void;
  onUpdateSegmentName: (segmentId: string, name: string, thaiName: string) => void;
  onResetSegmentManpower: (segmentId: string) => void;
  onResetAllManpowerOverrides: () => void;
  onResetData: () => void;
  onChangeSection: (sectionId: PlantSectionId) => void;
  onChangeShareRatioMode: (mode: ShareRatioFormulaMode) => void;
  onSaveToStorage: () => void;
  onOpenFormulaGuide: () => void;
}

export const MasterTable: React.FC<MasterTableProps> = ({
  result,
  lineSegments,
  products,
  orders,
  settings,
  manualOverrides,
  onUpdateOrder,
  onUpdateCycleTime,
  onUpdateUph,
  onUpdateManpower,
  onUpdateAvgManpower,
  onUpdateSegmentName,
  onResetSegmentManpower,
  onResetAllManpowerOverrides,
  onResetData,
  onChangeSection,
  onChangeShareRatioMode,
  onSaveToStorage,
  onOpenFormulaGuide,
}) => {
  const [isEditMode, setIsEditMode] = useState(true); // Default to easily editable
  const [showSummaryTable, setShowSummaryTable] = useState(true); // Default to showing summary table
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExactDecimals, setShowExactDecimals] = useState(false);
  const [showProcessSumRows, setShowProcessSumRows] = useState(true);

  const { weeks, area, workshop, monthName, activeSectionId, shareRatioMode } = settings;

  // Filtered segments
  const displayedSegments = selectedSegmentFilter === 'all'
    ? lineSegments
    : lineSegments.filter((s) => s.id === selectedSegmentFilter);

  // Filtered products
  const displayedProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Plant Section Selector Bar */}
      <div className="bg-slate-900 text-white p-3.5 px-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">เลือกหมวดแผนกการผลิต:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800 rounded-lg">
          {PLANT_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => {
                setSelectedSegmentFilter('all');
                onChangeSection(sec.id);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeSectionId === sec.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
              }`}
            >
              {sec.thaiName}
            </button>
          ))}
        </div>
      </div>

      {/* Table Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              {settings.modelTitle}
            </h2>
            <span className="text-xs font-normal text-slate-500">
              · {area} / {workshop} · {monthName}
            </span>
            <button
              onClick={onOpenFormulaGuide}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>ดูสูตรการคำนวณกำลังคน</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ทุกตัวเลขในตารางสามารถแก้ไขและบันทึกได้ทันที โดยสัดส่วน Share Ratio และกำลังคนจะคำนวณใหม่อัตโนมัติ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Share Ratio Formula Mode Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Percent className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 font-medium">สูตร Share Ratio:</span>
            <select
              value={shareRatioMode}
              onChange={(e) => onChangeShareRatioMode(e.target.value as ShareRatioFormulaMode)}
              className="bg-transparent border-none text-blue-700 font-semibold focus:outline-hidden cursor-pointer"
            >
              <option value="total_weekly_volume">หาร Volume ทั้งหมด (สัดส่วนแท้ 100%)</option>
              <option value="base_volume">หาร ฐานกำลังผลิต (17,500 ชิ้น)</option>
              <option value="process_volume">หาร ยอดรวมของกระบวนการนั้น</option>
            </select>
          </div>

          {/* Segment Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSegmentFilter}
              onChange={(e) => setSelectedSegmentFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">ทุกสายการผลิตในหมวดนี้ ({lineSegments.length} สาย)</option>
              {lineSegments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search Product */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหารุ่น..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 w-32 sm:w-36"
            />
          </div>

          {/* Toggle Process SUM rows */}
          <button
            onClick={() => setShowProcessSumRows(!showProcessSumRows)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showProcessSumRows
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="แสดงแถวสรุปผลรวมยอดผลิตของแต่ละ Process"
          >
            {showProcessSumRows ? 'ซ่อนแถว SUM แต่ละ Process' : 'แสดงช่อง SUM แต่ละ Process'}
          </button>

          {/* Decimal Toggle */}
          <button
            onClick={() => setShowExactDecimals(!showExactDecimals)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showExactDecimals
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showExactDecimals ? 'ทศนิยมจริง' : 'ปัดเศษคน'}
          </button>

          {/* Save Button (Persistent to localStorage) */}
          <button
            onClick={onSaveToStorage}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึกข้อมูล (Save)</span>
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isEditMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 font-semibold'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5 text-amber-700" />
                <span>โหมดแก้ไข (เปิดอยู่)</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>เปิดโหมดแก้ไข</span>
              </>
            )}
          </button>

          {/* Toggle Summary Table Button */}
          <button
            onClick={() => setShowSummaryTable(!showSummaryTable)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              showSummaryTable
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="แสดงหรือซ่อนตารางสรุปจัดสรรกำลังคนและค่าเฉลี่ย AVG"
          >
            <Users className="w-3.5 h-3.5 text-amber-700" />
            <span>{showSummaryTable ? 'ตารางสรุปกำลังคน & AVG (เปิด)' : 'ตารางสรุปกำลังคน & AVG'}</span>
            {showSummaryTable ? <ChevronUp className="w-3 h-3 text-amber-700" /> : <ChevronDown className="w-3 h-3 text-slate-400" />}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามภาพเอกสารใช่หรือไม่?')) {
                onResetData();
              }
            }}
            title="รีเซ็ตกลับเป็นค่าเริ่มต้นตามภาพเอกสาร"
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Embedded Summary Table: Manpower Allocation & AVG by Line Segment */}
      {showSummaryTable && (
        <div className="border-b-2 border-slate-300 bg-amber-50/25 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                <Users className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>ตารางสรุปจัดสรรกำลังคนและค่าเฉลี่ย AVG ตามสายการผลิต</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    แก้ไขตัวเลขบน Web ได้โดยตรง
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  คลิกพิมพ์แก้ไขจำนวนคน 1W–4W, ค่าเฉลี่ย AVG, UPH และชื่อสายการผลิตได้ทันที ยอดรวม Grand Total และกราฟจะคำนวณใหม่แบบเรียลไทม์
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('คุณต้องการคืนค่าตัวเลขกำลังคนและ AVG ทั้งหมดกลับเป็นค่าคำนวณตามสูตร IE ใช่หรือไม่?')) {
                    onResetAllManpowerOverrides();
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
                title="รีเซ็ตตัวเลขกำลังคนทั้งหมดกลับไปใช้สูตร IE"
              >
                <RotateCcw className="w-3 h-3 text-slate-500" />
                <span>คืนค่าสูตร IE ทั้งหมด</span>
              </button>

              <button
                type="button"
                onClick={onSaveToStorage}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
              >
                <Save className="w-3 h-3" />
                <span>บันทึกข้อมูล</span>
              </button>

              <div className="px-3 py-1 bg-amber-200/90 text-amber-950 text-xs font-bold rounded-lg border border-amber-400">
                รวม AVG: {result.totals.avgManpower} คน
              </div>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-2xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5 min-w-[200px]">สายการผลิต (Line Segment)</th>
                  <th className="px-3 py-2.5 text-center min-w-[80px]">UPH</th>
                  <th className="px-3 py-2.5 text-right min-w-[80px]">1W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[80px]">2W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[80px]">3W (คน)</th>
                  <th className="px-3 py-2.5 text-right min-w-[80px]">4W (คน)</th>
                  <th className="px-4 py-2.5 text-center bg-amber-300 text-amber-950 font-bold border-l border-amber-400 min-w-[90px]">
                    AVG (เฉลี่ย)
                  </th>
                  <th className="px-4 py-2.5 text-right min-w-[100px]">สัดส่วนในหมวด</th>
                  <th className="px-3 py-2.5 text-center min-w-[95px]">สถานะ / คืนค่า</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 tabular-nums font-mono text-slate-800">
                {displayedSegments.map((segment) => {
                  const summary = result.summaries.find((s) => s.lineSegment.id === segment.id);
                  const avgSeg = summary?.avgManpower ?? 0;
                  const totalAvg = result.totals.avgManpower || 1;
                  const sharePercent = ((Number(avgSeg) / Number(totalAvg)) * 100).toFixed(1);

                  const hasSegmentOverride =
                    (manualOverrides?.manpower?.[segment.id] &&
                      Object.keys(manualOverrides.manpower[segment.id]).length > 0) ||
                    manualOverrides?.avg?.[segment.id] !== undefined;

                  return (
                    <tr key={`summary-row-${segment.id}`} className="hover:bg-slate-50 transition-colors">
                      {/* Segment Name (Editable) */}
                      <td className="px-4 py-2 font-sans font-medium text-slate-900">
                        {isEditMode ? (
                          <div className="space-y-1 w-full max-w-[260px]">
                            <input
                              type="text"
                              value={segment.name}
                              onChange={(e) =>
                                onUpdateSegmentName(segment.id, e.target.value, segment.thaiName)
                              }
                              title="แก้ไขชื่อภาษาอังกฤษของสายการผลิต"
                              className="w-full px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                            />
                            <input
                              type="text"
                              value={segment.thaiName}
                              onChange={(e) =>
                                onUpdateSegmentName(segment.id, segment.name, e.target.value)
                              }
                              title="แก้ไขชื่อภาษาไทยของสายการผลิต"
                              className="w-full px-1.5 py-0.5 text-[10px] text-slate-500 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-900">{segment.name}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{segment.thaiName}</div>
                          </div>
                        )}
                      </td>

                      {/* UPH (Editable) */}
                      <td className="px-3 py-2 text-center font-bold text-amber-700">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={segment.uph}
                            onChange={(e) => onUpdateUph(segment.id, parseInt(e.target.value, 10) || 0)}
                            title="แก้ไขเป้าหมายผลิตต่อชั่วโมง (UPH)"
                            className="w-16 px-1.5 py-1 text-center text-xs font-mono font-bold bg-amber-50 border border-amber-300 rounded focus:bg-white focus:outline-hidden"
                          />
                        ) : (
                          <span>{segment.uph}</span>
                        )}
                      </td>

                      {/* Manpower 1W–4W (Editable) */}
                      {weeks.map((w) => {
                        const mpVal = summary?.manpower[w] ?? 0;
                        const isWeekOverridden = manualOverrides?.manpower?.[segment.id]?.[w] !== undefined;

                        return (
                          <td key={`sum-mp-${segment.id}-${w}`} className="px-3 py-2 text-right font-semibold">
                            {isEditMode ? (
                              <input
                                type="number"
                                value={mpVal}
                                onChange={(e) =>
                                  onUpdateManpower(segment.id, w, parseInt(e.target.value, 10) || 0)
                                }
                                title={`แก้ไขจำนวนกำลังคนที่จัดสรรในสัปดาห์ ${w}`}
                                className={`w-16 px-1.5 py-1 text-right text-xs font-mono font-bold rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                                  isWeekOverridden
                                    ? 'bg-amber-100 border-2 border-amber-500 text-amber-950'
                                    : 'bg-emerald-50 border border-emerald-300 text-emerald-950'
                                }`}
                              />
                            ) : (
                              <span className={`inline-block px-2 py-0.5 rounded font-bold border ${
                                isWeekOverridden
                                  ? 'bg-amber-100 text-amber-950 border-amber-400'
                                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                              }`}>
                                {mpVal}
                              </span>
                            )}
                          </td>
                        );
                      })}

                      {/* AVG Column (Editable) */}
                      <td className="px-4 py-2 text-center font-extrabold text-amber-950 bg-amber-100/70 border-l border-amber-300">
                        {isEditMode ? (
                          <input
                            type="number"
                            value={avgSeg}
                            onChange={(e) =>
                              onUpdateAvgManpower(segment.id, parseInt(e.target.value, 10) || 0)
                            }
                            title="แก้ไขค่าเฉลี่ย AVG ของสายการผลิตนี้"
                            className={`w-16 px-1.5 py-1 text-center text-xs font-mono font-extrabold rounded focus:bg-white focus:outline-hidden ${
                              manualOverrides?.avg?.[segment.id] !== undefined
                                ? 'bg-amber-300 border-2 border-amber-600 text-amber-950'
                                : 'bg-amber-200 border border-amber-400 text-amber-950'
                            }`}
                          />
                        ) : (
                          <span className={`inline-block px-2.5 py-0.5 rounded font-extrabold border ${
                            manualOverrides?.avg?.[segment.id] !== undefined
                              ? 'bg-amber-300 text-amber-950 border-amber-500'
                              : 'bg-amber-200 text-amber-950 border-amber-400/50'
                          }`}>
                            {avgSeg}
                          </span>
                        )}
                      </td>

                      {/* Share of Category */}
                      <td className="px-4 py-2 text-right font-semibold text-slate-600">
                        {sharePercent}%
                      </td>

                      {/* Status / Revert */}
                      <td className="px-3 py-2 text-center font-sans">
                        {hasSegmentOverride ? (
                          <button
                            type="button"
                            onClick={() => onResetSegmentManpower(segment.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded transition-colors shadow-2xs"
                            title="คลิกเพื่อคืนค่าคำนวณตามสูตร IE สำหรับสายการผลิตนี้"
                          >
                            <RotateCcw className="w-2.5 h-2.5" />
                            <span>คืนสูตร IE</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded">
                            <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                            <span>ตามสูตร</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-900 text-white font-bold text-xs">
                <tr>
                  <td className="px-4 py-2.5 font-sans uppercase">รวมอัตรากำลังพล (Total Manpower)</td>
                  <td className="px-3 py-2.5 text-center text-amber-300 font-mono">
                    {result.totals.uph['1W']}
                  </td>
                  {weeks.map((w) => (
                    <td key={`sum-foot-${w}`} className="px-3 py-2.5 text-right text-emerald-300 font-mono text-sm">
                      {result.totals.manpower[w]}
                    </td>
                  ))}
                  <td className="px-4 py-2.5 text-center text-amber-950 font-mono text-sm bg-amber-400 border-l border-amber-500 font-extrabold">
                    {result.totals.avgManpower}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-300 font-mono">
                    100.0%
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-400 font-mono text-[11px]">
                    /
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Main Responsive Table */}
      <div className="overflow-x-auto max-h-[720px] border-collapse relative">
        <table className="w-full text-xs text-left border-collapse border-spacing-0">
          {/* Header Tier 1 & 2 */}
          <thead className="sticky top-0 z-20 bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider text-[11px] shadow-xs">
            {/* Header Tier 1 */}
            <tr className="border-b border-slate-300">
              <th rowSpan={2} className="px-3 py-2.5 border-r border-slate-300 bg-slate-200/90 text-center w-16">
                区域<br /><span className="text-[10px] font-normal text-slate-500">Area</span>
              </th>
              <th rowSpan={2} className="px-3 py-2.5 border-r border-slate-300 bg-slate-200/90 text-center w-16">
                车间<br /><span className="text-[10px] font-normal text-slate-500">Workshop</span>
              </th>
              <th rowSpan={2} className="px-3 py-2.5 border-r border-slate-300 bg-slate-200/90 min-w-[150px]">
                线段<br /><span className="text-[10px] font-normal text-slate-500">Line Segment</span>
              </th>
              <th rowSpan={2} className="px-3 py-2.5 border-r border-slate-300 bg-slate-200/90 min-w-[110px]">
                产品系列<br /><span className="text-[10px] font-normal text-slate-500">Product Series</span>
              </th>
              <th rowSpan={2} className="px-2.5 py-2.5 border-r border-slate-300 bg-slate-200/90 text-right min-w-[95px]">
                产品工时<br /><span className="text-[10px] font-normal text-slate-500">Cycle Time (s)</span>
              </th>

              {/* Order Volumes */}
              <th colSpan={4} className="px-3 py-2 border-r border-slate-300 text-center bg-blue-100/70 text-blue-900">
                {monthName} 订单量 (Order Volume)
              </th>

              {/* Production Ratio */}
              <th colSpan={4} className="px-3 py-2 border-r border-slate-300 text-center bg-slate-200/80 text-slate-800">
                {monthName} 产量占比 (Share Ratio)
              </th>

              {/* Weighted Labor Hours */}
              <th colSpan={4} className="px-3 py-2 border-r border-slate-300 text-center bg-indigo-100/80 text-indigo-950 font-bold">
                加权工时 Weighted labor hours (s)
              </th>

              {/* UPH */}
              <th colSpan={4} className="px-3 py-2 border-r border-slate-300 text-center bg-amber-100/80 text-amber-950 font-bold">
                UPH (Units Per Hour)
              </th>

              {/* Manpower */}
              <th colSpan={4} className="px-3 py-2 border-r border-slate-300 text-center bg-emerald-100/90 text-emerald-950 font-bold">
                标准定编 การจัดสรรบุคลากรตามมาตรฐาน (Headcount)
              </th>

              {/* AVG Column */}
              <th rowSpan={2} className="px-3 py-2.5 text-center bg-amber-300 text-amber-950 font-extrabold min-w-[65px] border-l border-amber-400">
                AVG<br /><span className="text-[10px] font-normal text-amber-900">เฉลี่ย</span>
              </th>
            </tr>

            {/* Header Tier 2: 1W, 2W, 3W, 4W */}
            <tr className="border-b border-slate-300 bg-slate-100 text-slate-600 text-center font-mono text-[10px]">
              {/* Order Volume Weeks */}
              {weeks.map((w) => (
                <th key={`ord-${w}`} className="px-2 py-1.5 border-r border-slate-200 min-w-[55px] bg-blue-50/50">
                  {w}
                </th>
              ))}

              {/* Share Ratio Weeks */}
              {weeks.map((w) => (
                <th key={`shr-${w}`} className="px-1.5 py-1.5 border-r border-slate-200 min-w-[50px]">
                  {w}
                </th>
              ))}

              {/* Weighted Hours Weeks */}
              {weeks.map((w) => (
                <th key={`wh-${w}`} className="px-2 py-1.5 border-r border-slate-200 min-w-[52px] bg-indigo-50/60 font-semibold text-indigo-900">
                  {w}
                </th>
              ))}

              {/* UPH Weeks */}
              {weeks.map((w) => (
                <th key={`uph-${w}`} className="px-2 py-1.5 border-r border-slate-200 min-w-[50px] bg-amber-50/60 font-semibold text-amber-900">
                  {w}
                </th>
              ))}

              {/* Manpower Weeks */}
              {weeks.map((w) => (
                <th key={`mp-${w}`} className="px-2 py-1.5 border-r border-slate-200 min-w-[55px] bg-emerald-50/80 font-bold text-emerald-900">
                  {w}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-200 font-mono text-slate-800 tabular-nums">
            {displayedSegments.map((segment, segIdx) => {
              const summary = result.summaries.find((s) => s.lineSegment.id === segment.id);
              const numProducts = displayedProducts.length;
              // Total rows for this segment = products rows + 1 (if process sum row shown)
              const totalSegmentRows = numProducts + (showProcessSumRows ? 1 : 0);

              const isEvenSegment = segIdx % 2 === 0;

              return (
                <React.Fragment key={segment.id}>
                  {displayedProducts.map((product, prodIdx) => {
                    const isFirstRowOfSegment = prodIdx === 0;
                    const cycleTime = segment.productCycleTimes[product.id] || 0;
                    const rowData = result.rows.find(
                      (r) => r.lineSegment.id === segment.id && r.productId === product.id
                    );

                    const rowBg = isEvenSegment ? 'hover:bg-slate-50/80' : 'bg-slate-50/30 hover:bg-slate-100/60';

                    return (
                      <tr key={`${segment.id}-${product.id}`} className={`transition-colors ${rowBg}`}>
                        {/* Area Column - Merged over entire table */}
                        {segIdx === 0 && prodIdx === 0 && (
                          <td
                            rowSpan={displayedSegments.length * totalSegmentRows}
                            className="px-3 py-3 border-r border-slate-300 font-sans font-bold text-slate-700 bg-white align-middle text-center"
                          >
                            {area}
                          </td>
                        )}

                        {/* Workshop Column - Merged over entire table */}
                        {segIdx === 0 && prodIdx === 0 && (
                          <td
                            rowSpan={displayedSegments.length * totalSegmentRows}
                            className="px-3 py-3 border-r border-slate-300 font-sans font-bold text-slate-700 bg-white align-middle text-center"
                          >
                            {workshop}
                          </td>
                        )}

                        {/* Line Segment Column - Merged across products & sum row of this segment */}
                        {isFirstRowOfSegment && (
                          <td
                            rowSpan={totalSegmentRows}
                            className="px-3 py-3 border-r border-slate-300 font-sans font-semibold text-slate-900 bg-white/95 align-middle"
                          >
                            {isEditMode ? (
                              <div className="space-y-1 min-w-[130px]">
                                <input
                                  type="text"
                                  value={segment.name}
                                  onChange={(e) =>
                                    onUpdateSegmentName(segment.id, e.target.value, segment.thaiName)
                                  }
                                  title="แก้ไขชื่อภาษาอังกฤษของสายการผลิต"
                                  className="w-full px-1.5 py-0.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded focus:border-blue-500 focus:outline-hidden"
                                />
                                <input
                                  type="text"
                                  value={segment.thaiName}
                                  onChange={(e) =>
                                    onUpdateSegmentName(segment.id, segment.name, e.target.value)
                                  }
                                  title="แก้ไขชื่อภาษาไทยของสายการผลิต"
                                  className="w-full px-1.5 py-0.5 text-[10px] text-slate-500 bg-white border border-slate-200 rounded focus:border-blue-500 focus:outline-hidden"
                                />
                              </div>
                            ) : (
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{segment.name}</div>
                                <div className="text-[10px] text-slate-500 font-normal mt-0.5">{segment.thaiName}</div>
                              </div>
                            )}
                          </td>
                        )}

                        {/* Product Name */}
                        <td className="px-3 py-1.5 border-r border-slate-200 font-sans font-medium text-slate-700 whitespace-nowrap">
                          {product.name}
                        </td>

                        {/* Product Cycle Time (Editable) */}
                        <td className="px-2.5 py-1.5 border-r border-slate-200 text-right">
                          {isEditMode ? (
                            <input
                              type="number"
                              step="0.01"
                              value={cycleTime}
                              onChange={(e) =>
                                onUpdateCycleTime(segment.id, product.id, parseFloat(e.target.value) || 0)
                              }
                              title="คลิกเพื่อแก้ไขเวลามาตรฐาน (Standard Cycle Time วินาที)"
                              className="w-18 px-1.5 py-0.5 text-right text-xs bg-amber-50/70 border border-amber-300/80 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono"
                            />
                          ) : (
                            <span className={cycleTime === 0 ? 'text-slate-300' : 'text-slate-800'}>
                              {cycleTime.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* 9月订单量 (Order Volume: 1W, 2W, 3W, 4W - Editable & Linked) */}
                        {weeks.map((w) => {
                          const qty = orders[product.id]?.[w] || 0;
                          return (
                            <td key={`order-${w}`} className="px-2 py-1.5 border-r border-slate-200 text-right bg-blue-50/15">
                              {isEditMode ? (
                                <input
                                  type="number"
                                  value={qty}
                                  onChange={(e) =>
                                    onUpdateOrder(product.id, w, parseInt(e.target.value, 10) || 0)
                                  }
                                  title="แก้ไขยอดสั่งผลิต (Order Volume) - จะคำนวณ Share Ratio ให้อัตโนมัติ"
                                  className="w-15 px-1 py-0.5 text-right text-xs bg-blue-50/80 border border-blue-300 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono"
                                />
                              ) : (
                                <span className={qty === 0 ? 'text-slate-300' : 'text-slate-800'}>
                                  {qty.toLocaleString()}
                                </span>
                              )}
                            </td>
                          );
                        })}

                        {/* 9月份产量占比 (Production Share Ratio - Linked directly to Order Volume) */}
                        {weeks.map((w) => {
                          const share = rowData?.shares[w] || 0;
                          return (
                            <td
                              key={`share-${w}`}
                              className="px-1.5 py-1.5 border-r border-slate-200 text-right text-slate-700"
                              title={`สัดส่วนยอดผลิต = ${orders[product.id]?.[w] || 0} ÷ ยอดรวม = ${share.toFixed(2)}%`}
                            >
                              {share > 0 ? (
                                <span className="font-semibold text-blue-700">
                                  {share.toFixed(1)}%
                                </span>
                              ) : (
                                <span className="text-slate-300">0%</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Weighted Labor Hours (Merged per Segment) */}
                        {isFirstRowOfSegment &&
                          weeks.map((w) => {
                            const wh = summary?.weightedHours[w] || 0;
                            return (
                              <td
                                key={`wh-seg-${w}`}
                                rowSpan={totalSegmentRows}
                                className="px-2 py-2 border-r border-slate-200 text-center font-bold text-indigo-900 bg-indigo-50/30 align-middle text-sm"
                              >
                                {wh.toFixed(1)}
                              </td>
                            );
                          })}

                        {/* UPH (Merged per Segment - editable) */}
                        {isFirstRowOfSegment &&
                          weeks.map((w) => {
                            return (
                              <td
                                key={`uph-seg-${w}`}
                                rowSpan={totalSegmentRows}
                                className="px-2 py-2 border-r border-slate-200 text-center font-semibold text-amber-900 bg-amber-50/30 align-middle text-xs"
                              >
                                {isEditMode ? (
                                  <input
                                    type="number"
                                    value={segment.uph}
                                    onChange={(e) =>
                                      onUpdateUph(segment.id, parseInt(e.target.value, 10) || 0)
                                    }
                                    title="แก้ไขเป้าหมายผลิตต่อชั่วโมง (UPH)"
                                    className="w-12 px-1 py-0.5 text-center text-xs bg-white border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-mono font-bold"
                                  />
                                ) : (
                                  <span>{segment.uph}</span>
                                )}
                              </td>
                            );
                          })}

                        {/* Standard Headcount (Manpower) (Merged per Segment) */}
                        {isFirstRowOfSegment &&
                          weeks.map((w) => {
                            const mp = summary?.manpower[w] || 0;
                            const raw = summary?.rawManpower[w] || 0;
                            const isOverridden = manualOverrides?.manpower?.[segment.id]?.[w] !== undefined;

                            return (
                              <td
                                key={`mp-seg-${w}`}
                                rowSpan={totalSegmentRows}
                                className="px-2 py-2 border-r border-slate-200 text-center font-bold text-slate-900 bg-emerald-50/50 align-middle text-sm"
                              >
                                {isEditMode ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <input
                                      type="number"
                                      value={mp}
                                      onChange={(e) =>
                                        onUpdateManpower(segment.id, w, parseInt(e.target.value, 10) || 0)
                                      }
                                      title={isOverridden ? `สัปดาห์ ${w}: แก้ไขด้วยตนเอง (ค่าคำนวณตามสูตร: ${raw.toFixed(2)})` : `สัปดาห์ ${w}: คำนวณตามสูตร IE`}
                                      className={`w-14 px-1 py-0.5 text-center text-xs font-mono font-bold rounded focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-hidden ${
                                        isOverridden
                                          ? 'bg-amber-100 border-2 border-amber-500 text-amber-950 shadow-2xs'
                                          : 'bg-emerald-100/90 border border-emerald-300 text-emerald-950'
                                      }`}
                                    />
                                    {isOverridden && (
                                      <span className="text-[9px] text-amber-700 font-sans font-medium">ปรับแก้</span>
                                    )}
                                  </div>
                                ) : (
                                  <span className={`inline-block px-2 py-0.5 rounded font-bold border ${
                                    isOverridden
                                      ? 'bg-amber-100 text-amber-950 border-amber-400'
                                      : 'bg-emerald-100/90 text-emerald-950 border-emerald-300/80'
                                  }`}>
                                    {showExactDecimals ? raw.toFixed(2) : mp}
                                  </span>
                                )}
                              </td>
                            );
                          })}

                        {/* AVG Column (Merged per Segment) */}
                        {isFirstRowOfSegment && (() => {
                          const isAvgOverridden = manualOverrides?.avg?.[segment.id] !== undefined;
                          const hasAnyOverride =
                            isAvgOverridden ||
                            (manualOverrides?.manpower?.[segment.id] &&
                              Object.keys(manualOverrides.manpower[segment.id]).length > 0);

                          return (
                            <td
                              rowSpan={totalSegmentRows}
                              className="px-3 py-2 text-center font-extrabold text-amber-950 bg-amber-100/70 align-middle text-sm border-l border-amber-300"
                            >
                              {isEditMode ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <input
                                    type="number"
                                    value={summary?.avgManpower || 0}
                                    onChange={(e) =>
                                      onUpdateAvgManpower(segment.id, parseInt(e.target.value, 10) || 0)
                                    }
                                    title={isAvgOverridden ? `ค่าเฉลี่ย AVG ปรับแก้ (คำนวณตามสูตร: ${summary?.rawAvgManpower})` : 'ค่าเฉลี่ย AVG'}
                                    className={`w-14 px-1 py-0.5 text-center text-xs font-mono font-extrabold rounded focus:bg-white focus:ring-1 focus:ring-amber-500 focus:outline-hidden ${
                                      isAvgOverridden
                                        ? 'bg-amber-300 border-2 border-amber-600 text-amber-950 shadow-2xs'
                                        : 'bg-amber-200 border border-amber-400 text-amber-950'
                                    }`}
                                  />
                                  {hasAnyOverride && (
                                    <button
                                      type="button"
                                      onClick={() => onResetSegmentManpower(segment.id)}
                                      title="คืนค่าคำนวณตามสูตร IE สำหรับสายการผลิตนี้"
                                      className="inline-flex items-center gap-0.5 text-[9px] text-amber-800 hover:text-amber-950 hover:underline font-sans mt-0.5"
                                    >
                                      <RotateCcw className="w-2.5 h-2.5" />
                                      <span>คืนสูตร</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className={`inline-block px-2.5 py-0.5 rounded border ${
                                  isAvgOverridden
                                    ? 'bg-amber-300 text-amber-950 border-amber-500 font-extrabold'
                                    : 'bg-amber-200/90 text-amber-950 border-amber-400/50 font-bold'
                                }`}>
                                  {showExactDecimals
                                    ? summary?.rawAvgManpower.toFixed(2)
                                    : summary?.avgManpower}
                                </span>
                              )}
                            </td>
                          );
                        })()}
                      </tr>
                    );
                  })}

                  {/* Dedicated Subtotal Row: SUM Order Volume แต่ละ Process */}
                  {showProcessSumRows && (
                    <tr className="bg-slate-100/90 font-bold text-slate-900 border-t border-b-2 border-slate-300 text-[11px]">
                      <td className="px-3 py-2 border-r border-slate-300 font-sans text-indigo-900 flex items-center justify-between">
                        <span>SUM: {segment.name}</span>
                        <span className="text-[10px] font-normal text-slate-500">(ยอดรวมกระบวนการ)</span>
                      </td>

                      <td className="px-2.5 py-2 border-r border-slate-300 text-right text-slate-400 font-mono">
                        /
                      </td>

                      {/* Process Total Order Volumes per week */}
                      {weeks.map((w) => {
                        const procOrders = summary?.processTotalOrders[w] || 0;
                        return (
                          <td
                            key={`proc-sum-ord-${w}`}
                            className="px-2 py-2 border-r border-slate-300 text-right text-blue-900 bg-blue-100/40 font-mono font-extrabold"
                            title={`ยอดผลิตรวมในกระบวนการ ${segment.name} สัปดาห์ ${w}`}
                          >
                            {procOrders.toLocaleString()}
                          </td>
                        );
                      })}

                      {/* Process Total Shares per week */}
                      {weeks.map((w) => {
                        const procShare = summary?.processTotalShares[w] || 0;
                        return (
                          <td
                            key={`proc-sum-share-${w}`}
                            className="px-1.5 py-2 border-r border-slate-300 text-right text-slate-800 bg-slate-200/50 font-mono font-bold"
                            title={`ผลรวมสัดส่วน Share Ratio ในสัปดาห์ ${w}`}
                          >
                            {procShare.toFixed(1)}%
                          </td>
                        );
                      })}
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Table Footer: 合计 (Grand Total) */}
          <tfoot className="sticky bottom-0 z-10 bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-center uppercase tracking-wider font-sans">
                合计 (Total Sum รวมทั้งหมด)
              </td>
              <td className="px-2.5 py-3 text-right text-slate-400 font-mono">/</td>

              {/* Order Volume Totals */}
              {weeks.map((w) => (
                <td key={`tot-ord-${w}`} className="px-2 py-3 text-right text-blue-200 font-mono">
                  {result.totals.orders[w].toLocaleString()}
                </td>
              ))}

              {/* Share Ratio Totals */}
              {weeks.map((w) => (
                <td key={`tot-shr-${w}`} className="px-1.5 py-3 text-right text-slate-300 font-mono text-[11px]">
                  {result.totals.shares[w].toFixed(1)}%
                </td>
              ))}

              {/* Weighted Hours Totals */}
              {weeks.map((w) => (
                <td key={`tot-wh-${w}`} className="px-2 py-3 text-center text-indigo-200 font-mono text-sm">
                  {result.totals.weightedHours[w].toFixed(1)}
                </td>
              ))}

              {/* UPH Totals */}
              {weeks.map((w) => (
                <td key={`tot-uph-${w}`} className="px-2 py-3 text-center text-amber-200 font-mono text-xs">
                  {result.totals.uph[w]}
                </td>
              ))}

              {/* Manpower Totals */}
              {weeks.map((w) => (
                <td key={`tot-mp-${w}`} className="px-2 py-3 text-center text-emerald-300 font-mono text-base font-extrabold bg-emerald-950/60">
                  {result.totals.manpower[w]}
                </td>
              ))}

              {/* AVG Total (Yellow Footer) */}
              <td className="px-3 py-3 text-center text-amber-950 font-mono text-base font-extrabold bg-amber-400 border-l border-amber-500">
                {result.totals.avgManpower}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Footnote / Explanations */}
      <div className="p-4 bg-slate-50 text-[11px] text-slate-600 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>* <strong>สูตร Share Ratio ปัจจุบัน:</strong> {shareRatioMode === 'total_weekly_volume' ? 'Order Volume ÷ ยอดผลิตรวมทั้งหมดของสัปดาห์นั้น × 100%' : 'Order Volume ÷ 17,500 × 100%'}</span>
          <span aria-hidden="true">·</span>
          <span>* <strong>แถว SUM:</strong> สรุปยอดคำสั่งผลิตรวมของแต่ละ Process ในแต่ละสัปดาห์</span>
          <span aria-hidden="true">·</span>
          <span>* <strong>การบันทึก:</strong> ข้อมูลทั้งหมดจะบันทึกลงในหน่วยความจำของเว็บ (Local Storage) อัตโนมัติ</span>
        </div>
        <div className="text-slate-500 font-medium">
          ยอดรวมโมเดลจริง: 1W={result.weeklyUniqueUnits['1W'].toLocaleString()}, 2W={result.weeklyUniqueUnits['2W'].toLocaleString()}, 3W={result.weeklyUniqueUnits['3W'].toLocaleString()}, 4W={result.weeklyUniqueUnits['4W'].toLocaleString()} ชิ้น
        </div>
      </div>
    </div>
  );
};
