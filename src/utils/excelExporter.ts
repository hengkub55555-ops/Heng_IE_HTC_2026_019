import * as XLSX from 'xlsx';
import { calculateManpower } from './calculator';
import { CalculationSettings, LineSegment, ProductModel, WeeklyOrders } from '../types/manpower';

export function exportManpowerToExcel(
  allLineSegments: LineSegment[],
  products: ProductModel[],
  orders: WeeklyOrders,
  settings: CalculationSettings,
  fileName: string = 'Thailand_Factory_Manpower_Model_LineB.xlsx'
) {
  const wb = XLSX.utils.book_new();
  const { weeks, area, workshop, monthName, baseVolume, efficiency } = settings;

  // Helper to build sheet data for a specific set of segments
  const buildSectionSheet = (
    sheetTitle: string,
    targetSegments: LineSegment[],
    sectionNameLabel: string
  ) => {
    const calcResult = calculateManpower(targetSegments, products, orders, {
      ...settings,
      activeSectionId: 'all', // calculate all within targetSegments
    });

    const wsData: any[][] = [];

    // Title Row
    wsData.push([`${settings.modelTitle} - ${sectionNameLabel} (${monthName}) - Area: ${area} / ${workshop}`]);
    wsData.push([]); // blank

    // Header Row 1
    const headerRow1 = [
      '区域 (Area)',
      '车间 (Workshop)',
      '线段 (Line Segment)',
      '产品系列 (Product Series)',
      '产品工时 (Cycle Time s)',
      `${monthName} 订单量 (Order Qty)`,
      '',
      '',
      '',
      `${monthName} 产量占比 (Share %)`,
      '',
      '',
      '',
      '加权工时 Weighted labor hours',
      '',
      '',
      '',
      'UPH (Units Per Hour)',
      '',
      '',
      '',
      '标准定编 การจัดสรรบุคลากรตามมาตรฐาน (Headcount)',
      '',
      '',
      '',
      'AVG (เฉลี่ย)',
    ];
    wsData.push(headerRow1);

    // Header Row 2
    const headerRow2 = [
      '',
      '',
      '',
      '',
      '',
      ...weeks,
      ...weeks,
      ...weeks,
      ...weeks,
      ...weeks,
      'เฉลี่ย',
    ];
    wsData.push(headerRow2);

    // Data Rows
    targetSegments.forEach((segment, segIdx) => {
      const summary = calcResult.summaries.find((s) => s.lineSegment.id === segment.id);

      products.forEach((product, prodIdx) => {
        const rowData = calcResult.rows.find(
          (r) => r.lineSegment.id === segment.id && r.productId === product.id
        );

        const cycleTime = segment.productCycleTimes[product.id] || 0;
        const orderValues = weeks.map((w) => rowData?.orders[w] ?? 0);
        const shareValues = weeks.map((w) => {
          const val = rowData?.shares[w] ?? 0;
          return `${Math.round(val)}%`;
        });

        const isFirstRowOfSegment = prodIdx === 0;

        const weightedVals = isFirstRowOfSegment
          ? weeks.map((w) => Math.round(summary?.weightedHours[w] ?? 0))
          : ['', '', '', ''];

        const uphVals = isFirstRowOfSegment
          ? weeks.map((w) => summary?.uph[w] ?? segment.uph)
          : ['', '', '', ''];

        const manpowerVals = isFirstRowOfSegment
          ? weeks.map((w) => summary?.manpower[w] ?? 0)
          : ['', '', '', ''];

        const avgVal = isFirstRowOfSegment ? (summary?.avgManpower ?? 0) : '';

        const row = [
          segIdx === 0 && prodIdx === 0 ? area : '',
          segIdx === 0 && prodIdx === 0 ? workshop : '',
          prodIdx === 0 ? segment.name : '',
          product.name,
          cycleTime,
          ...orderValues,
          ...shareValues,
          ...weightedVals,
          ...uphVals,
          ...manpowerVals,
          avgVal,
        ];

        wsData.push(row);
      });
    });

    // Totals Row
    const totalRow = [
      '合计 (Total)',
      '',
      '',
      '',
      '/',
      ...weeks.map((w) => calcResult.totals.orders[w]),
      ...weeks.map((w) => `${calcResult.totals.shares[w].toFixed(2)}%`),
      ...weeks.map((w) => Math.round(calcResult.totals.weightedHours[w])),
      ...weeks.map((w) => calcResult.totals.uph[w]),
      ...weeks.map((w) => calcResult.totals.manpower[w]),
      calcResult.totals.avgManpower,
    ];
    wsData.push(totalRow);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws['!cols'] = [
      { wch: 12 }, // Area
      { wch: 10 }, // Workshop
      { wch: 28 }, // Line segment
      { wch: 16 }, // Product series
      { wch: 14 }, // Cycle time
      { wch: 8 },  // 1W ord
      { wch: 8 },  // 2W ord
      { wch: 8 },  // 3W ord
      { wch: 8 },  // 4W ord
      { wch: 8 },  // 1W share
      { wch: 8 },  // 2W share
      { wch: 8 },  // 3W share
      { wch: 8 },  // 4W share
      { wch: 8 },  // 1W wh
      { wch: 8 },  // 2W wh
      { wch: 8 },  // 3W wh
      { wch: 8 },  // 4W wh
      { wch: 8 },  // 1W uph
      { wch: 8 },  // 2W uph
      { wch: 8 },  // 3W uph
      { wch: 8 },  // 4W uph
      { wch: 8 },  // 1W mp
      { wch: 8 },  // 2W mp
      { wch: 8 },  // 3W mp
      { wch: 8 },  // 4W mp
      { wch: 10 }, // AVG
    ];

    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  };

  // Sheet 1: Pre-Assembly & Foaming (Sheet 2 image)
  const preFoamingSegments = allLineSegments.filter((s) => s.sectionId === 'pre_foaming');
  buildSectionSheet('1_Pre_Foaming (ขึ้นรูปและโฟม)', preFoamingSegments, 'Pre-Assembly & Foaming');

  // Sheet 2: Assembly & Final (Sheet 1 image)
  const assemblyFinalSegments = allLineSegments.filter((s) => s.sectionId === 'assembly_final');
  buildSectionSheet('2_Assembly_Final (ประกอบและท้ายไลน์)', assemblyFinalSegments, 'Assembly & Final Line');

  // Sheet 3: Executive Summary (สรุปภาพรวมโรงงาน)
  const allCalcResult = calculateManpower(allLineSegments, products, orders, {
    ...settings,
    activeSectionId: 'all',
  });

  const summaryData: any[][] = [];
  summaryData.push(['สรุปผลการจัดสรรอัตรากำลังพลรวม LineB CAB (Total Factory Manpower Summary)']);
  summaryData.push([`โมเดล: ${settings.modelTitle} | แผนก: ${area} (${workshop}) | ประจำเดือน: ${monthName}`]);
  summaryData.push([]);

  // Table 1: All 12 Segments Headcount
  summaryData.push(['ตารางอัตรากำลังพลแยกตามสายการผลิตทั้ง 12 สาย (All 12 Production Lines)']);
  summaryData.push(['หมวดงาน (Section)', 'สายการผลิต (Line Segment)', 'ชื่อไทย', 'UPH', ...weeks, 'AVG (คน)']);

  allLineSegments.forEach((segment) => {
    const summary = allCalcResult.summaries.find((s) => s.lineSegment.id === segment.id);
    const mpValues = weeks.map((w) => summary?.manpower[w] ?? 0);
    const sectionLabel = segment.sectionId === 'pre_foaming' ? 'ขึ้นรูป & โฟม' : 'ประกอบ & ท้ายไลน์';

    summaryData.push([
      sectionLabel,
      segment.name,
      segment.thaiName,
      segment.uph,
      ...mpValues,
      summary?.avgManpower ?? 0,
    ]);
  });

  // Total Row
  summaryData.push([
    'รวมทั้งหมด (Grand Total)',
    '12 สายการผลิตรวม',
    'อัตรากำลังพลรวมโรงงาน',
    allCalcResult.totals.uph['1W'],
    ...weeks.map((w) => allCalcResult.totals.manpower[w]),
    allCalcResult.totals.avgManpower,
  ]);

  summaryData.push([]);
  summaryData.push(['สถิติผลผลิตและประสิทธิภาพแรงงาน (Production & Productivity Metrics)']);
  summaryData.push(['รายการ', ...weeks, 'รวมเดือน']);
  summaryData.push([
    'ยอดผลิตตามสัปดาห์ (Units)',
    ...weeks.map((w) => allCalcResult.weeklyUniqueUnits[w]),
    allCalcResult.totalMonthlyUnits,
  ]);
  summaryData.push([
    'กำลังคนรวมโรงงาน (Headcount)',
    ...weeks.map((w) => allCalcResult.totals.manpower[w]),
    allCalcResult.totals.avgManpower + ' (เฉลี่ย)',
  ]);
  summaryData.push([
    'ผลิตภาพแรงงาน (Units / Person)',
    ...weeks.map((w) => {
      const mp = allCalcResult.totals.manpower[w];
      const units = allCalcResult.weeklyUniqueUnits[w];
      return mp > 0 ? Math.round(units / mp) : 0;
    }),
    Math.round(
      allCalcResult.totalMonthlyUnits /
        (weeks.reduce((a, w) => a + allCalcResult.totals.manpower[w], 0) || 1)
    ),
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet(summaryData);
  ws3['!cols'] = [
    { wch: 18 },
    { wch: 32 },
    { wch: 28 },
    { wch: 10 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, '3_Total_Summary (สรุปภาพรวม)');

  // Download trigger
  XLSX.writeFile(wb, fileName);
}
