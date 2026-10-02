import {
  LineSegment,
  ProductModel,
  WeeklyOrders,
  CalculationSettings,
  CalculatedRow,
  SegmentSummary,
  TableTotals,
} from '../types/manpower';

export interface CalculationResult {
  rows: CalculatedRow[];
  summaries: SegmentSummary[];
  totals: TableTotals;
  weeklyUniqueUnits: Record<string, number>;
  totalMonthlyUnits: number;
}

export function calculateManpower(
  lineSegments: LineSegment[],
  products: ProductModel[],
  orders: WeeklyOrders,
  settings: CalculationSettings
): CalculationResult {
  const { weeks, baseVolume, efficiency, roundingMode, activeSectionId, shareRatioMode } = settings;

  // Filter segments if activeSectionId is not 'all'
  const targetSegments =
    activeSectionId && activeSectionId !== 'all'
      ? lineSegments.filter((s) => s.sectionId === activeSectionId)
      : lineSegments;

  // 1. Calculate unique order units per week (Total weekly volume across all models)
  const weeklyUniqueUnits: Record<string, number> = {};
  weeks.forEach((w) => {
    weeklyUniqueUnits[w] = products.reduce((acc, p) => acc + (orders[p.id]?.[w] || 0), 0);
  });

  const totalMonthlyUnits = Object.values(weeklyUniqueUnits).reduce((a, b) => a + b, 0);

  // 2. Build rows for each line segment and each product
  const rows: CalculatedRow[] = [];
  const summaries: SegmentSummary[] = [];

  targetSegments.forEach((segment) => {
    const processTotalOrders: Record<string, number> = {};
    const processTotalShares: Record<string, number> = {};
    const weightedHours: Record<string, number> = {};
    const uphMap: Record<string, number> = {};
    const rawManpower: Record<string, number> = {};
    const manpower: Record<string, number> = {};

    weeks.forEach((w) => {
      processTotalOrders[w] = 0;
      processTotalShares[w] = 0;
      weightedHours[w] = 0;
      uphMap[w] = segment.uph;
    });

    // Calculate total orders for this segment first (useful if process_volume mode)
    const segmentOrdersPerWeek: Record<string, number> = {};
    weeks.forEach((w) => {
      segmentOrdersPerWeek[w] = products.reduce((acc, p) => acc + (orders[p.id]?.[w] || 0), 0);
    });

    products.forEach((product) => {
      const cycleTime = segment.productCycleTimes[product.id] || 0;
      const productOrders: Record<string, number> = {};
      const shares: Record<string, number> = {};

      weeks.forEach((w) => {
        const qty = orders[product.id]?.[w] || 0;
        productOrders[w] = qty;
        processTotalOrders[w] += qty;

        // Share Ratio Calculation:
        // Mode 1: 'total_weekly_volume' -> qty / totalWeeklyVolume * 100 (สูตร: ช่อง 1 หาร Volume ทั้งหมด)
        // Mode 2: 'base_volume' -> qty / baseVolume * 100 (เช่น 17,500)
        // Mode 3: 'process_volume' -> qty / segmentOrdersPerWeek[w] * 100
        let sharePercent = 0;
        if (shareRatioMode === 'total_weekly_volume') {
          const totalVol = weeklyUniqueUnits[w] || 0;
          sharePercent = totalVol > 0 ? (qty / totalVol) * 100 : 0;
        } else if (shareRatioMode === 'process_volume') {
          const procVol = segmentOrdersPerWeek[w] || 0;
          sharePercent = procVol > 0 ? (qty / procVol) * 100 : 0;
        } else {
          // base_volume mode
          sharePercent = baseVolume > 0 ? (qty / baseVolume) * 100 : 0;
        }

        shares[w] = sharePercent;
        processTotalShares[w] += sharePercent;

        // Weighted hours contribution:
        if (shareRatioMode === 'total_weekly_volume') {
          // Weighted cycle time = sum(cycleTime * (qty / totalVol))
          const totalVol = weeklyUniqueUnits[w] || 0;
          weightedHours[w] += totalVol > 0 ? cycleTime * (qty / totalVol) : 0;
        } else if (shareRatioMode === 'process_volume') {
          const procVol = segmentOrdersPerWeek[w] || 0;
          weightedHours[w] += procVol > 0 ? cycleTime * (qty / procVol) : 0;
        } else {
          // base_volume mode: cycleTime * (qty / baseVolume)
          weightedHours[w] += cycleTime * (baseVolume > 0 ? qty / baseVolume : 0);
        }
      });

      rows.push({
        lineSegment: segment,
        productId: product.id,
        productName: product.name,
        cycleTime,
        orders: productOrders,
        shares,
      });
    });

    // Calculate manpower for this segment
    weeks.forEach((w) => {
      const wh = weightedHours[w];
      const uph = segment.uph;
      // Formula: (wh * uph) / (3600 * efficiency)
      const raw = efficiency > 0 ? (wh * uph) / (3600 * efficiency) : 0;
      rawManpower[w] = raw;

      if (roundingMode === 'round') {
        manpower[w] = Math.round(raw);
      } else if (roundingMode === 'ceil') {
        manpower[w] = Math.ceil(raw);
      } else if (roundingMode === 'floor') {
        manpower[w] = Math.floor(raw);
      } else {
        manpower[w] = Number(raw.toFixed(2));
      }
    });

    // Calculate AVG manpower for this segment across the weeks
    const mpValues = weeks.map((w) => manpower[w]);
    const rawMpValues = weeks.map((w) => rawManpower[w]);
    const rawAvg = rawMpValues.reduce((a, b) => a + b, 0) / (weeks.length || 1);
    const avgMp = Math.round(mpValues.reduce((a, b) => a + b, 0) / (weeks.length || 1));

    const processTotalMonthOrders = weeks.reduce((sum, w) => sum + processTotalOrders[w], 0);

    summaries.push({
      lineSegment: segment,
      processTotalOrders,
      processTotalMonthOrders,
      processTotalShares,
      weightedHours,
      uph: uphMap,
      rawManpower,
      manpower,
      avgManpower: avgMp,
      rawAvgManpower: Number(rawAvg.toFixed(2)),
    });
  });

  // 3. Totals across all target segments
  const totalOrders: Record<string, number> = {};
  const totalShares: Record<string, number> = {};
  const totalWeightedHours: Record<string, number> = {};
  const totalUph: Record<string, number> = {};
  const totalManpower: Record<string, number> = {};

  weeks.forEach((w) => {
    // Total orders summed across displayed segments
    totalOrders[w] = rows.reduce((acc, r) => acc + (r.orders[w] || 0), 0);

    // Total shares summed across displayed rows
    totalShares[w] = rows.reduce((acc, r) => acc + (r.shares[w] || 0), 0);

    // Sum of weighted hours across segments
    totalWeightedHours[w] = summaries.reduce((acc, s) => acc + (s.weightedHours[w] || 0), 0);

    // Sum of UPH across segments
    totalUph[w] = summaries.reduce((acc, s) => acc + (s.uph[w] || 0), 0);

    // Sum of manpower
    totalManpower[w] = summaries.reduce((acc, s) => acc + (s.manpower[w] || 0), 0);
  });

  const totalAvgMp = summaries.reduce((acc, s) => acc + s.avgManpower, 0);

  return {
    rows,
    summaries,
    totals: {
      orders: totalOrders,
      shares: totalShares,
      weightedHours: totalWeightedHours,
      uph: totalUph,
      manpower: totalManpower,
      avgManpower: totalAvgMp,
      totalProductionUnits: weeklyUniqueUnits,
    },
    weeklyUniqueUnits,
    totalMonthlyUnits,
  };
}
