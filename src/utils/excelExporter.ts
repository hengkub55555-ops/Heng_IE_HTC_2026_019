import * as XLSX from 'xlsx';
import { calculateManpower } from './calculator';
import {
  BLineIndirectRole,
  BLineShiftSettings,
  CalculationSettings,
  LineSegment,
  ManualOverrides,
  ProductModel,
  WeeklyOrders,
} from '../types/manpower';

export function exportManpowerToExcel(
  allLineSegments: LineSegment[],
  products: ProductModel[],
  orders: WeeklyOrders,
  settings: CalculationSettings,
  fileName: string = 'Thailand_Factory_Manpower_Model_LineB.xlsx',
  manualOverrides?: ManualOverrides,
  indirectRoles?: BLineIndirectRole[],
  shiftSettings?: BLineShiftSettings
) {
  const wb = XLSX.utils.book_new();
  const { weeks, area, workshop, monthName, baseVolume, efficiency } = settings;

  // Helper to build sheet data for a specific set of segments
  const buildSectionSheet = (
    sheetTitle: string,
    targetSegments: LineSegment[],
    sectionNameLabel: string
  ) => {
    const calcResult = calculateManpower(
      targetSegments,
      products,
      orders,
      {
        ...settings,
        activeSectionId: 'all', // calculate all within targetSegments
      },
      manualOverrides
    );

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

      // Add Process Subtotal (SUM) Row into Excel export
      const procOrderVals = weeks.map((w) => summary?.processTotalOrders[w] ?? 0);
      const procShareVals = weeks.map((w) => `${(summary?.processTotalShares[w] ?? 0).toFixed(1)}%`);
      const procSumRow = [
        '',
        '',
        `SUM: ${segment.name}`,
        'ยอดรวมกระบวนการ (Process SUM)',
        '/',
        ...procOrderVals,
        ...procShareVals,
        '', '', '', '', // weighted
        '', '', '', '', // uph
        '', '', '', '', // manpower
        '',
      ];
      wsData.push(procSumRow);
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
  const allCalcResult = calculateManpower(
    allLineSegments,
    products,
    orders,
    {
      ...settings,
      activeSectionId: 'all',
    },
    manualOverrides
  );

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

  // Sheet 4: Line B Allocation & Workforce Model (จัดสรรกำลังคน Line B และแรงงานทางอ้อม)
  if (indirectRoles && indirectRoles.length > 0) {
    const bLineData: any[][] = [];
    bLineData.push(['ตารางจัดสรรอัตรากำลังพลและข้อมูลโรงงาน Line B (Line B Workforce Allocation Model)']);
    bLineData.push([`โมเดล: ${settings.modelTitle} | สายการผลิต: Line B (${area} - ${workshop}) | ประจำเดือน: ${monthName}`]);
    bLineData.push([]);

    // Part 1: Direct Labor (12 lines)
    bLineData.push(['1. อัตรากำลังคนทางตรงหน้าสายการผลิต 12 สาย (Line B Direct Labor - DL)']);
    bLineData.push(['ลำดับ', 'หมวดแผนก (Section)', 'สายการผลิต (Line Segment)', 'ชื่อไทย', 'UPH', ...weeks, 'AVG (คน)']);

    allLineSegments.forEach((segment, idx) => {
      const summary = allCalcResult.summaries.find((s) => s.lineSegment.id === segment.id);
      const mpValues = weeks.map((w) => summary?.manpower[w] ?? 0);
      const secName = segment.sectionId === 'pre_foaming' ? 'ขึ้นรูป & โฟม' : 'ประกอบ & ท้ายไลน์';
      bLineData.push([
        idx + 1,
        secName,
        segment.name,
        segment.thaiName,
        segment.uph,
        ...mpValues,
        summary?.avgManpower ?? 0,
      ]);
    });

    bLineData.push([
      'รวม',
      'แรงงานทางตรง Line B',
      'รวม 12 สายการผลิต (DL Total)',
      '',
      allCalcResult.totals.uph['1W'],
      ...weeks.map((w) => allCalcResult.totals.manpower[w]),
      allCalcResult.totals.avgManpower,
    ]);

    bLineData.push([]);

    // Part 2: Indirect Labor (Support Roles)
    bLineData.push(['2. อัตรากำลังคนทางอ้อมและสายสนับสนุน Line B (Line B Indirect Labor & Support - IDL)']);
    bLineData.push(['ลำดับ', 'ตำแหน่งงาน (Role Name)', 'ชื่อไทย', 'กะทำงาน (Shift Plan)', ...weeks, 'AVG (คน)', 'หน้าที่รับผิดชอบหลัก']);

    const idlTotals: Record<string, number> = {};
    weeks.forEach((w) => {
      idlTotals[w] = indirectRoles.reduce((sum, r) => sum + (r.headcount[w] || 0), 0);
    });
    const idlAvgTotal = Math.round(
      indirectRoles.reduce((sum, r) => sum + (r.avgHeadcount || 0), 0)
    );

    indirectRoles.forEach((role, idx) => {
      const hcValues = weeks.map((w) => role.headcount[w] || 0);
      bLineData.push([
        idx + 1,
        role.roleName,
        role.roleThaiName,
        role.shift,
        ...hcValues,
        role.avgHeadcount,
        role.responsibilities,
      ]);
    });

    bLineData.push([
      'รวม',
      'แรงงานทางอ้อม Line B',
      'รวมทุกตำแหน่งสนับสนุน (IDL Total)',
      'ทุกกะการผลิต',
      ...weeks.map((w) => idlTotals[w]),
      idlAvgTotal,
      'สนับสนุนสายการผลิต Line B',
    ]);

    bLineData.push([]);

    // Part 3: Grand Total Summary
    const grandTotals: Record<string, number> = {};
    weeks.forEach((w) => {
      grandTotals[w] = allCalcResult.totals.manpower[w] + (idlTotals[w] || 0);
    });
    const grandAvgTotal = allCalcResult.totals.avgManpower + idlAvgTotal;

    bLineData.push(['3. ตารางสรุปจัดสรรกำลังคนรวม Line B (Grand Total Headcount - DL + IDL)']);
    bLineData.push(['ประเภทแรงงาน', ...weeks, 'AVG (เฉลี่ย)', 'สัดส่วน %']);
    bLineData.push([
      'แรงงานทางตรง (Direct Labor - DL)',
      ...weeks.map((w) => allCalcResult.totals.manpower[w]),
      allCalcResult.totals.avgManpower,
      `${((allCalcResult.totals.avgManpower / (grandAvgTotal || 1)) * 100).toFixed(1)}%`,
    ]);
    bLineData.push([
      'แรงงานทางอ้อม (Indirect Labor - IDL)',
      ...weeks.map((w) => idlTotals[w]),
      idlAvgTotal,
      `${((idlAvgTotal / (grandAvgTotal || 1)) * 100).toFixed(1)}%`,
    ]);
    bLineData.push([
      'ยอดรวมอัตรากำลังพลทั้งสิ้น Line B (Grand Total)',
      ...weeks.map((w) => grandTotals[w]),
      grandAvgTotal,
      '100.0%',
    ]);

    if (shiftSettings) {
      bLineData.push([]);
      bLineData.push(['4. ข้อมูลการจัดกะและพารามิเตอร์สายการผลิต Line B (Shift & Line Parameters)']);
      bLineData.push(['พารามิเตอร์', 'ค่าที่กำหนด', 'หน่วย / คำอธิบาย']);
      bLineData.push(['จำนวนกะการทำงาน (Active Shifts)', shiftSettings.activeShifts, shiftSettings.activeShifts === 1 ? '1 กะปกติ + OT' : '2 กะหมุนเวียน']);
      bLineData.push(['กำลังคนต่อกะ (Headcount per Shift)', Math.ceil(grandAvgTotal / shiftSettings.activeShifts), 'คน / กะ']);
      bLineData.push(['เวลาทำงานปกติต่อกะ', shiftSettings.dayShiftHours, 'ชั่วโมง / วัน']);
      bLineData.push(['เวลาทำงานจริงที่มีประสิทธิภาพ', shiftSettings.dayShiftEffectiveMinutes, 'นาที / วัน']);
      bLineData.push(['ชั่วโมงทำงานล่วงเวลา (O.T.)', shiftSettings.otHoursPerDay, 'ชั่วโมง / วัน']);
      bLineData.push(['วันทำงานต่อสัปดาห์ / เดือน', `${shiftSettings.workDaysPerWeek} วัน/สัปดาห์`, `${shiftSettings.workDaysPerMonth} วัน/เดือน`]);
      bLineData.push(['ความเร็วมาตรฐานสายผลิต Line B', 'ขึ้นรูป 120 UPH / โฟมและประกอบ 70 UPH', 'Takt Time 30.0s - 51.4s']);
      bLineData.push(['สถานีคอขวด (Bottleneck Stations)', 'PU Foam & Cab Pre-Assembly', 'ข้อจำกัดเวลาบ่มโฟมและเวลาประกอบ']);
    }

    const ws4 = XLSX.utils.aoa_to_sheet(bLineData);
    ws4['!cols'] = [
      { wch: 8 },
      { wch: 28 },
      { wch: 28 },
      { wch: 24 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 8 },
      { wch: 12 },
      { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(wb, ws4, '4_LineB_Allocation (จัดสรรคน LineB)');
  }

  // Download trigger
  XLSX.writeFile(wb, fileName);
}

export function exportLineAToExcel(
  allLineSegments: LineSegment[],
  products: ProductModel[],
  orders: WeeklyOrders,
  settings: CalculationSettings,
  fileName: string = 'Thailand_Factory_Manpower_Model_LineA.xlsx',
  manualOverrides?: ManualOverrides,
  indirectRoles?: BLineIndirectRole[],
  shiftSettings?: BLineShiftSettings
) {
  const wb = XLSX.utils.book_new();
  const { weeks, area, workshop, monthName } = settings;

  const buildSectionSheet = (
    sheetTitle: string,
    targetSegments: LineSegment[],
    sectionNameLabel: string
  ) => {
    const calcResult = calculateManpower(
      targetSegments,
      products,
      orders,
      {
        ...settings,
        activeSectionId: 'all',
      },
      manualOverrides
    );

    const wsData: any[][] = [];
    wsData.push([`${settings.modelTitle} - ${sectionNameLabel} (${monthName}) - Area: ${area} / ${workshop}`]);
    wsData.push([]);

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
      'UPH (Pcs/H)',
      '',
      '',
      '',
      '标准定编人数 (Standard Headcount)',
      '',
      '',
      '',
      'AVG (เฉลี่ย)',
    ];

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
      '',
    ];

    wsData.push(headerRow1);
    wsData.push(headerRow2);

    targetSegments.forEach((segment) => {
      const segSummary = calcResult.summaries.find((s) => s.lineSegment.id === segment.id);
      const rows = calcResult.rows.filter((r) => r.lineSegment.id === segment.id);

      rows.forEach((row, rIdx) => {
        const orderVals = weeks.map((w) => row.orders[w] || 0);
        const shareVals = weeks.map((w) => `${(row.shares[w] || 0).toFixed(1)}%`);
        const uphVals = rIdx === 0 ? weeks.map((w) => segSummary?.uph[w] || segment.uph) : weeks.map(() => '');
        const mpVals = rIdx === 0 ? weeks.map((w) => segSummary?.manpower[w] || 0) : weeks.map(() => '');
        const avgVal = rIdx === 0 ? segSummary?.avgManpower || 0 : '';

        wsData.push([
          rIdx === 0 ? area : '',
          rIdx === 0 ? workshop : '',
          rIdx === 0 ? `${segment.name} (${segment.thaiName})` : '',
          row.productName,
          row.cycleTime,
          ...orderVals,
          ...shareVals,
          ...uphVals,
          ...mpVals,
          avgVal,
        ]);
      });

      if (segSummary) {
        wsData.push([
          '',
          '',
          `${segment.name} - รวมยอด (SUM)`,
          '',
          '',
          ...weeks.map((w) => segSummary.processTotalOrders[w] || 0),
          ...weeks.map((w) => `${(segSummary.processTotalShares[w] || 0).toFixed(1)}%`),
          ...weeks.map((w) => segSummary.uph[w] || segment.uph),
          ...weeks.map((w) => segSummary.manpower[w] || 0),
          segSummary.avgManpower,
        ]);
      }
      wsData.push([]);
    });

    wsData.push([
      'รวมทั้งสิ้น (TOTAL)',
      '',
      '',
      '',
      '',
      ...weeks.map((w) => calcResult.totals.orders[w] || 0),
      ...weeks.map((w) => `${(calcResult.totals.shares[w] || 0).toFixed(1)}%`),
      ...weeks.map((w) => calcResult.totals.uph[w] || 0),
      ...weeks.map((w) => calcResult.totals.manpower[w] || 0),
      calcResult.totals.avgManpower,
    ]);

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);
  };

  const preFoaming = allLineSegments.filter((s) => s.sectionId === 'pre_foaming');
  const assemblyFinal = allLineSegments.filter((s) => s.sectionId === 'assembly_final');

  if (preFoaming.length > 0) {
    buildSectionSheet('1_PreFoaming_A', preFoaming, 'Pre-Assembly & Foaming Line A');
  }
  if (assemblyFinal.length > 0) {
    buildSectionSheet('2_AssemblyFinal_A', assemblyFinal, 'Assembly & Final Line A');
  }

  // Summary Sheet
  const allCalcResult = calculateManpower(allLineSegments, products, orders, {
    ...settings,
    activeSectionId: 'all',
  }, manualOverrides);

  const summaryData: any[][] = [];
  summaryData.push([`${settings.modelTitle} - Line A Executive Summary`]);
  summaryData.push([]);
  summaryData.push(['No.', 'Line Segment', 'Thai Name', 'Section', 'UPH', ...weeks, 'AVG (คน)']);

  allLineSegments.forEach((seg, idx) => {
    const s = allCalcResult.summaries.find((sum) => sum.lineSegment.id === seg.id);
    summaryData.push([
      idx + 1,
      seg.name,
      seg.thaiName,
      seg.sectionId === 'pre_foaming' ? 'Pre-Foaming' : 'Assembly & Final',
      seg.uph,
      ...weeks.map((w) => s?.manpower[w] || 0),
      s?.avgManpower || 0,
    ]);
  });

  summaryData.push([
    'รวม',
    'รวมกำลังคนทางตรง Line A (DL Total)',
    '10 สายการผลิต',
    'ALL',
    '',
    ...weeks.map((w) => allCalcResult.totals.manpower[w]),
    allCalcResult.totals.avgManpower,
  ]);

  const wsSum = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, wsSum, '3_Summary_LineA');

  // Allocation Sheet (DL + IDL + Shift)
  if (indirectRoles && indirectRoles.length > 0) {
    const aLineData: any[][] = [];
    aLineData.push(['ตารางจัดสรรกำลังคนและข้อมูลการผลิต Line A (Line A Workforce Allocation)']);
    aLineData.push([`Area: ${area} | Workshop: ${workshop} | Month: ${monthName} | 2 Shifts Operation`]);
    aLineData.push([]);

    aLineData.push(['1. อัตรากำลังคนทางตรง (Direct Labor - DL 10 Lines)']);
    aLineData.push(['#', 'สายการผลิต', 'ชื่อภาษาไทย', 'UPH', 'Takt (s)', ...weeks, 'AVG (คน)', 'สัดส่วน %']);

    allLineSegments.forEach((seg, idx) => {
      const s = allCalcResult.summaries.find((sum) => sum.lineSegment.id === seg.id);
      const avgVal = s?.avgManpower || 0;
      const share = ((avgVal / (allCalcResult.totals.avgManpower || 1)) * 100).toFixed(1);
      const takt = seg.uph > 0 ? (3600 / seg.uph).toFixed(1) : '-';
      aLineData.push([
        idx + 1,
        seg.name,
        seg.thaiName,
        seg.uph,
        takt,
        ...weeks.map((w) => s?.manpower[w] || 0),
        avgVal,
        `${share}%`,
      ]);
    });

    aLineData.push([
      'รวม',
      'รวมกำลังคนทางตรง Line A (DL Total)',
      '10 สายการผลิต',
      '',
      '',
      ...weeks.map((w) => allCalcResult.totals.manpower[w]),
      allCalcResult.totals.avgManpower,
      '100.0%',
    ]);

    aLineData.push([]);
    aLineData.push(['2. อัตรากำลังคนทางอ้อมและสนับสนุน (Indirect Labor - IDL Line A)']);
    aLineData.push(['#', 'ตำแหน่งงาน (Role)', 'ชื่อภาษาไทย', 'กะการทำงาน', ...weeks, 'AVG (คน)', 'หน้าที่รับผิดชอบ']);

    const idlTotals: Record<string, number> = {};
    weeks.forEach((w) => {
      idlTotals[w] = indirectRoles.reduce((sum, r) => sum + (r.headcount[w] || 0), 0);
    });
    const idlAvgTotal = Math.round(
      indirectRoles.reduce((sum, r) => sum + (r.avgHeadcount || 0), 0)
    );

    indirectRoles.forEach((role, idx) => {
      aLineData.push([
        idx + 1,
        role.roleName,
        role.roleThaiName,
        role.shift,
        ...weeks.map((w) => role.headcount[w] || 0),
        role.avgHeadcount,
        role.responsibilities,
      ]);
    });

    aLineData.push([
      'รวม',
      'แรงงานทางอ้อม Line A',
      'รวมทุกตำแหน่งสนับสนุน (IDL Total)',
      '2 กะหมุนเวียน',
      ...weeks.map((w) => idlTotals[w]),
      idlAvgTotal,
      'สนับสนุนสายการผลิต Line A',
    ]);

    aLineData.push([]);
    const grandTotals: Record<string, number> = {};
    weeks.forEach((w) => {
      grandTotals[w] = allCalcResult.totals.manpower[w] + (idlTotals[w] || 0);
    });
    const grandAvgTotal = allCalcResult.totals.avgManpower + idlAvgTotal;

    aLineData.push(['3. ตารางสรุปจัดสรรกำลังคนรวม Line A (Grand Total Headcount - DL + IDL)']);
    aLineData.push(['ประเภทแรงงาน', ...weeks, 'AVG (เฉลี่ย)', 'สัดส่วน %']);
    aLineData.push([
      'แรงงานทางตรง (Direct Labor - DL)',
      ...weeks.map((w) => allCalcResult.totals.manpower[w]),
      allCalcResult.totals.avgManpower,
      `${((allCalcResult.totals.avgManpower / (grandAvgTotal || 1)) * 100).toFixed(1)}%`,
    ]);
    aLineData.push([
      'แรงงานทางอ้อม (Indirect Labor - IDL)',
      ...weeks.map((w) => idlTotals[w]),
      idlAvgTotal,
      `${((idlAvgTotal / (grandAvgTotal || 1)) * 100).toFixed(1)}%`,
    ]);
    aLineData.push([
      'ยอดรวมอัตรากำลังพลทั้งสิ้น Line A (Grand Total)',
      ...weeks.map((w) => grandTotals[w]),
      grandAvgTotal,
      '100.0%',
    ]);

    if (shiftSettings) {
      aLineData.push([]);
      aLineData.push(['4. ข้อมูลการจัดกะและพารามิเตอร์สายการผลิต Line A (Shift & Line Parameters)']);
      aLineData.push(['พารามิเตอร์', 'ค่าที่กำหนด', 'หน่วย / คำอธิบาย']);
      aLineData.push(['จำนวนกะการทำงาน (Active Shifts)', shiftSettings.activeShifts, `${shiftSettings.activeShifts} กะหมุนเวียน (กะเช้า & กะดึก)`]);
      aLineData.push(['กำลังคนต่อกะ (Headcount per Shift)', Math.ceil(grandAvgTotal / shiftSettings.activeShifts), 'คน / กะ']);
      aLineData.push(['เวลาทำงานปกติต่อกะ', shiftSettings.dayShiftHours, 'ชั่วโมง / วัน']);
      aLineData.push(['เวลาทำงานจริงที่มีประสิทธิภาพ', shiftSettings.dayShiftEffectiveMinutes, 'นาที / วัน']);
      aLineData.push(['ชั่วโมงทำงานล่วงเวลา (O.T.)', shiftSettings.otHoursPerDay, 'ชั่วโมง / วัน']);
      aLineData.push(['วันทำงานต่อสัปดาห์ / เดือน', `${shiftSettings.workDaysPerWeek} วัน/สัปดาห์`, `${shiftSettings.workDaysPerMonth} วัน/เดือน`]);
      aLineData.push(['ความเร็วมาตรฐานสายผลิต Line A', 'ขึ้นรูป & ท่อ 120 UPH / ประตู 90 UPH / โฟม & ประกอบ 80 UPH', 'Takt Time 30.0s - 45.0s']);
      aLineData.push(['สถานีคอขวด (Bottleneck Stations)', 'PU Foam Line A & Vacuum Line A', 'ข้อจำกัดเวลาบ่มโฟมและเวลาแวคคั่ม']);
    }

    const ws4 = XLSX.utils.aoa_to_sheet(aLineData);
    XLSX.utils.book_append_sheet(wb, ws4, '4_LineA_Allocation (จัดสรรคน LineA)');
  }

  XLSX.writeFile(wb, fileName);
}

export function exportFactoryComparisonToExcel(
  dataA: {
    lineSegments: LineSegment[];
    products: ProductModel[];
    orders: WeeklyOrders;
    settings: CalculationSettings;
    manualOverrides?: ManualOverrides;
    indirectRoles?: BLineIndirectRole[];
    shiftSettings?: BLineShiftSettings;
  },
  dataB: {
    lineSegments: LineSegment[];
    products: ProductModel[];
    orders: WeeklyOrders;
    settings: CalculationSettings;
    manualOverrides?: ManualOverrides;
    indirectRoles?: BLineIndirectRole[];
    shiftSettings?: BLineShiftSettings;
  },
  fileName: string = 'Thailand_Factory_Manpower_Comparison_LineA_vs_LineB.xlsx'
) {
  const wb = XLSX.utils.book_new();
  const weeks = ['1W', '2W', '3W', '4W'];

  const calcA = calculateManpower(dataA.lineSegments, dataA.products, dataA.orders, dataA.settings, dataA.manualOverrides);
  const calcB = calculateManpower(dataB.lineSegments, dataB.products, dataB.orders, dataB.settings, dataB.manualOverrides);

  const idlTotalA: Record<string, number> = {};
  const idlTotalB: Record<string, number> = {};
  weeks.forEach((w) => {
    idlTotalA[w] = (dataA.indirectRoles || []).reduce((acc, r) => acc + (r.headcount[w] || 0), 0);
    idlTotalB[w] = (dataB.indirectRoles || []).reduce((acc, r) => acc + (r.headcount[w] || 0), 0);
  });
  const idlAvgA = Math.round((dataA.indirectRoles || []).reduce((acc, r) => acc + (r.avgHeadcount || 0), 0));
  const idlAvgB = Math.round((dataB.indirectRoles || []).reduce((acc, r) => acc + (r.avgHeadcount || 0), 0));

  const gtA: Record<string, number> = {};
  const gtB: Record<string, number> = {};
  const facTotal: Record<string, number> = {};
  weeks.forEach((w) => {
    gtA[w] = calcA.totals.manpower[w] + (idlTotalA[w] || 0);
    gtB[w] = calcB.totals.manpower[w] + (idlTotalB[w] || 0);
    facTotal[w] = gtA[w] + gtB[w];
  });
  const gtAvgA = calcA.totals.avgManpower + idlAvgA;
  const gtAvgB = calcB.totals.avgManpower + idlAvgB;
  const facAvgTotal = gtAvgA + gtAvgB;

  const compData: any[][] = [];
  compData.push(['ระบบเปรียบเทียบและสรุปกำลังคนภาพรวมโรงงาน (Factory Manpower: Line A vs Line B)']);
  compData.push(['โรงงานประเทศไทย (Thailand Plant) · เดือน 9 (September)']);
  compData.push([]);

  compData.push(['1. สรุปเปรียบเทียบภาพรวม (Factory Executive Summary)']);
  compData.push(['ตัวชี้วัด (KPI)', 'Line A (A-line)', 'Line B (B-line)', 'รวมทั้งโรงงาน (Factory Total)']);
  compData.push(['แรงงานทางตรงเฉลี่ย (Direct Labor - DL)', `${calcA.totals.avgManpower} คน`, `${calcB.totals.avgManpower} คน`, `${calcA.totals.avgManpower + calcB.totals.avgManpower} คน`]);
  compData.push(['แรงงานทางอ้อมเฉลี่ย (Indirect Labor - IDL)', `${idlAvgA} คน`, `${idlAvgB} คน`, `${idlAvgA + idlAvgB} คน`]);
  compData.push(['รวมอัตรากำลังพลทั้งสิ้น (Grand Total Headcount)', `${gtAvgA} คน`, `${gtAvgB} คน`, `${facAvgTotal} คน`]);
  compData.push(['ยอดผลิตรวมทั้งสิ้น (Total Monthly Production)', `${calcA.totalMonthlyUnits.toLocaleString()} ชิ้น`, `${calcB.totalMonthlyUnits.toLocaleString()} ชิ้น`, `${(calcA.totalMonthlyUnits + calcB.totalMonthlyUnits).toLocaleString()} ชิ้น`]);
  compData.push(['ผลิตภาพแรงงาน (Productivity Pcs/Person/Month)', `${Math.round(calcA.totalMonthlyUnits / (gtAvgA || 1))} ชิ้น/คน`, `${Math.round(calcB.totalMonthlyUnits / (gtAvgB || 1))} ชิ้น/คน`, `${Math.round((calcA.totalMonthlyUnits + calcB.totalMonthlyUnits) / (facAvgTotal || 1))} ชิ้น/คน`]);
  compData.push(['จำนวนสายการผลิตย่อย (Line Segments)', '10 สายงาน', '12 สายงาน', '22 สายงาน']);
  compData.push(['กะการทำงาน (Shift System)', '2 กะหมุนเวียน', '1 กะปกติ + OT', '-']);
  compData.push([]);

  compData.push(['2. ตารางเปรียบเทียบจัดสรรกำลังคนตามสัปดาห์ (Weekly Comparison Table)']);
  compData.push(['หมวดหมู่ข้อมูล', 'สายการผลิต', ...weeks, 'AVG (คน)']);
  compData.push(['แรงงานทางตรง (DL)', 'Line A', ...weeks.map((w) => calcA.totals.manpower[w]), calcA.totals.avgManpower]);
  compData.push(['แรงงานทางตรง (DL)', 'Line B', ...weeks.map((w) => calcB.totals.manpower[w]), calcB.totals.avgManpower]);
  compData.push(['แรงงานทางอ้อม (IDL)', 'Line A', ...weeks.map((w) => idlTotalA[w]), idlAvgA]);
  compData.push(['แรงงานทางอ้อม (IDL)', 'Line B', ...weeks.map((w) => idlTotalB[w]), idlAvgB]);
  compData.push(['ยอดรวมกำลังคน (Total)', 'Line A', ...weeks.map((w) => gtA[w]), gtAvgA]);
  compData.push(['ยอดรวมกำลังคน (Total)', 'Line B', ...weeks.map((w) => gtB[w]), gtAvgB]);
  compData.push(['รวมทั้งโรงงาน (Factory Total)', 'Line A + Line B', ...weeks.map((w) => facTotal[w]), facAvgTotal]);

  const wsComp = XLSX.utils.aoa_to_sheet(compData);
  XLSX.utils.book_append_sheet(wb, wsComp, 'Factory_Comparison (เปรียบเทียบ)');

  XLSX.writeFile(wb, fileName);
}

