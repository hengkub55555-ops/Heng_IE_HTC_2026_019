import React, { useState } from 'react';
import { CalculationResult } from '../utils/calculator';
import { CalculationSettings, LineSegment, PlantSectionId, ProductModel, WeeklyOrders } from '../types/manpower';
import { PLANT_SECTIONS } from '../data/initialData';
import { Edit2, Check, Search, Filter, RotateCcw, Layers } from 'lucide-react';

interface MasterTableProps {
  result: CalculationResult;
  lineSegments: LineSegment[];
  products: ProductModel[];
  orders: WeeklyOrders;
  settings: CalculationSettings;
  onUpdateOrder: (productId: string, week: string, value: number) => void;
  onUpdateCycleTime: (segmentId: string, productId: string, value: number) => void;
  onUpdateUph: (segmentId: string, value: number) => void;
  onResetData: () => void;
  onChangeSection: (sectionId: PlantSectionId) => void;
}

export const MasterTable: React.FC<MasterTableProps> = ({
  result,
  lineSegments,
  products,
  orders,
  settings,
  onUpdateOrder,
  onUpdateCycleTime,
  onUpdateUph,
  onResetData,
  onChangeSection,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showExactDecimals, setShowExactDecimals] = useState(false);

  const { weeks, area, workshop, monthName, activeSectionId } = settings;

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
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{settings.modelTitle}</span>
            <span className="text-xs font-normal text-slate-500">
              · {area} / {workshop} · {monthName}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ตารางคำนวณอัตรากำลังคนมาตรฐาน สัดส่วนผลผลิต และค่าเฉลี่ย AVG (คลิกแก้ไขยอดสั่งผลิตหรือ UPH ได้โดยตรง)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Segment Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSegmentFilter}
              onChange={(e) => setSelectedSegmentFilter(e.target.value)}
              className="bg-transparent border-none text-slate-700 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">ทุกสายการผลิตในหมวดนี้ ({displayedSegments.length} สาย)</option>
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
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 w-32 sm:w-40"
            />
          </div>

          {/* Decimal Toggle */}
          <button
            onClick={() => setShowExactDecimals(!showExactDecimals)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showExactDecimals
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showExactDecimals ? 'ทศนิยมจริง (Exact)' : 'ปัดเศษจำนวนคน (Rounded)'}
          </button>

          {/* Edit Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              isEditMode
                ? 'bg-amber-500 border-amber-600 text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isEditMode ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>เสร็จสิ้น (Done)</span>
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>แก้ไขข้อมูล (Edit Mode)</span>
              </>
            )}
          </button>

          {/* Reset button */}
          <button
            onClick={() => {
              if (window.confirm('คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตามภาพเอกสารใช่หรือไม่?')) {
                onResetData();
              }
            }}
            title="รีเซ็ตกลับเป็นค่าเริ่มต้นตามภาพ"
            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Responsive Table */}
      <div className="overflow-x-auto max-h-[700px] border-collapse relative">
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
              <th rowSpan={2} className="px-2.5 py-2.5 border-r border-slate-300 bg-slate-200/90 text-right min-w-[90px]">
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

              {/* AVG Column from Image 2 */}
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

              return displayedProducts.map((product, prodIdx) => {
                const isFirstRowOfSegment = prodIdx === 0;
                const cycleTime = segment.productCycleTimes[product.id] || 0;
                const rowData = result.rows.find(
                  (r) => r.lineSegment.id === segment.id && r.productId === product.id
                );

                const isEvenSegment = segIdx % 2 === 0;
                const rowBg = isEvenSegment ? 'hover:bg-slate-50/70' : 'bg-slate-50/30 hover:bg-slate-100/60';

                return (
                  <tr key={`${segment.id}-${product.id}`} className={`transition-colors ${rowBg}`}>
                    {/* Area Column - Merged over entire table */}
                    {segIdx === 0 && prodIdx === 0 && (
                      <td
                        rowSpan={displayedSegments.length * numProducts}
                        className="px-3 py-3 border-r border-slate-300 font-sans font-bold text-slate-700 bg-white align-middle text-center"
                      >
                        {area}
                      </td>
                    )}

                    {/* Workshop Column - Merged over entire table */}
                    {segIdx === 0 && prodIdx === 0 && (
                      <td
                        rowSpan={displayedSegments.length * numProducts}
                        className="px-3 py-3 border-r border-slate-300 font-sans font-bold text-slate-700 bg-white align-middle text-center"
                      >
                        {workshop}
                      </td>
                    )}

                    {/* Line Segment Column - Merged across products of this segment */}
                    {isFirstRowOfSegment && (
                      <td
                        rowSpan={numProducts}
                        className="px-3 py-3 border-r border-slate-300 font-sans font-semibold text-slate-900 bg-white/90 align-middle"
                      >
                        <div className="font-bold text-slate-900 text-xs">{segment.name}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-0.5">{segment.thaiName}</div>
                      </td>
                    )}

                    {/* Product Name */}
                    <td className="px-3 py-1.5 border-r border-slate-200 font-sans font-medium text-slate-700 whitespace-nowrap">
                      {product.name}
                    </td>

                    {/* Product Cycle Time (Editable in Edit Mode) */}
                    <td className="px-2.5 py-1.5 border-r border-slate-200 text-right">
                      {isEditMode ? (
                        <input
                          type="number"
                          step="0.01"
                          value={cycleTime}
                          onChange={(e) =>
                            onUpdateCycleTime(segment.id, product.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-16 px-1 py-0.5 text-right text-xs bg-amber-50 border border-amber-300 rounded focus:outline-hidden"
                        />
                      ) : (
                        <span className={cycleTime === 0 ? 'text-slate-300' : 'text-slate-800'}>
                          {cycleTime.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* 9月订单量 (Order Volume: 1W, 2W, 3W, 4W) */}
                    {weeks.map((w) => {
                      const qty = orders[product.id]?.[w] || 0;
                      return (
                        <td key={`order-${w}`} className="px-2 py-1.5 border-r border-slate-200 text-right bg-blue-50/20">
                          {isEditMode ? (
                            <input
                              type="number"
                              value={qty}
                              onChange={(e) =>
                                onUpdateOrder(product.id, w, parseInt(e.target.value, 10) || 0)
                              }
                              className="w-14 px-1 py-0.5 text-right text-xs bg-blue-50 border border-blue-300 rounded focus:outline-hidden"
                            />
                          ) : (
                            <span className={qty === 0 ? 'text-slate-300' : 'text-slate-800'}>
                              {qty.toLocaleString()}
                            </span>
                          )}
                        </td>
                      );
                    })}

                    {/* 9月份产量占比 (Production Share: 1W, 2W, 3W, 4W) */}
                    {weeks.map((w) => {
                      const share = rowData?.shares[w] || 0;
                      return (
                        <td key={`share-${w}`} className="px-1.5 py-1.5 border-r border-slate-200 text-right text-slate-600">
                          {share > 0 ? `${Math.round(share)}%` : <span className="text-slate-300">0%</span>}
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
                            rowSpan={numProducts}
                            className="px-2 py-2 border-r border-slate-200 text-center font-bold text-indigo-900 bg-indigo-50/30 align-middle text-sm"
                          >
                            {Math.round(wh)}
                          </td>
                        );
                      })}

                    {/* UPH (Merged per Segment - editable in Edit Mode) */}
                    {isFirstRowOfSegment &&
                      weeks.map((w) => {
                        return (
                          <td
                            key={`uph-seg-${w}`}
                            rowSpan={numProducts}
                            className="px-2 py-2 border-r border-slate-200 text-center font-semibold text-amber-900 bg-amber-50/30 align-middle text-xs"
                          >
                            {isEditMode ? (
                              <input
                                type="number"
                                value={segment.uph}
                                onChange={(e) =>
                                  onUpdateUph(segment.id, parseInt(e.target.value, 10) || 0)
                                }
                                className="w-12 px-1 py-0.5 text-center text-xs bg-white border border-amber-300 rounded focus:outline-hidden"
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
                        return (
                          <td
                            key={`mp-seg-${w}`}
                            rowSpan={numProducts}
                            className="px-2 py-2 border-r border-slate-200 text-center font-bold text-slate-900 bg-emerald-50/50 align-middle text-sm"
                          >
                            <span className="inline-block px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-950 font-bold border border-emerald-200/60">
                              {showExactDecimals ? raw.toFixed(2) : mp}
                            </span>
                          </td>
                        );
                      })}

                    {/* AVG Column (Merged per Segment with Yellow Highlight as in Image 2) */}
                    {isFirstRowOfSegment && (
                      <td
                        rowSpan={numProducts}
                        className="px-3 py-2 text-center font-extrabold text-amber-950 bg-amber-100/70 align-middle text-sm border-l border-amber-300"
                      >
                        <span className="inline-block px-2.5 py-0.5 rounded bg-amber-200/90 text-amber-950 border border-amber-400/50">
                          {showExactDecimals
                            ? summary?.rawAvgManpower.toFixed(2)
                            : summary?.avgManpower}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              });
            })}
          </tbody>

          {/* Table Footer: 合计 (Totals) */}
          <tfoot className="sticky bottom-0 z-10 bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
            <tr>
              <td colSpan={4} className="px-4 py-3 text-center uppercase tracking-wider font-sans">
                合计 (Total Sum)
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
                  {result.totals.shares[w].toFixed(2)}%
                </td>
              ))}

              {/* Weighted Hours Totals */}
              {weeks.map((w) => (
                <td key={`tot-wh-${w}`} className="px-2 py-3 text-center text-indigo-200 font-mono text-sm">
                  {Math.round(result.totals.weightedHours[w])}
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
      <div className="p-4 bg-slate-50 text-[11px] text-slate-500 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>* <strong>ฐานกำลังผลิต (Base Volume):</strong> {settings.baseVolume.toLocaleString()} ชิ้น</span>
          <span aria-hidden="true">·</span>
          <span>* <strong>ประสิทธิภาพไลน์ (Efficiency/OEE):</strong> {(settings.efficiency * 100).toFixed(0)}%</span>
          <span aria-hidden="true">·</span>
          <span>* <strong>คอลัมน์ AVG:</strong> ค่าเฉลี่ยจำนวนคนที่ต้องจัดสรรตลอดทั้ง 4 สัปดาห์</span>
        </div>
        <div className="text-slate-500 font-medium">
          ยอดคำสั่งผลิตตามรุ่นจริง: 1W={result.weeklyUniqueUnits['1W'].toLocaleString()}, 2W={result.weeklyUniqueUnits['2W'].toLocaleString()}, 3W={result.weeklyUniqueUnits['3W'].toLocaleString()}, 4W={result.weeklyUniqueUnits['4W'].toLocaleString()} ชิ้น
        </div>
      </div>
    </div>
  );
};
