export interface ProductModel {
  id: string;
  name: string;
}

export type PlantSectionId = 'all' | 'pre_foaming' | 'assembly_final';

export interface PlantSection {
  id: PlantSectionId;
  name: string;
  thaiName: string;
  chineseName: string;
  description: string;
}

export interface LineSegment {
  id: string;
  sectionId: PlantSectionId;
  name: string;
  thaiName: string;
  uph: number;
  productCycleTimes: Record<string, number>; // productId -> cycle time in seconds
}

export interface WeeklyOrders {
  // productId -> week -> quantity
  [productId: string]: {
    [week: string]: number;
  };
}

export interface CalculationSettings {
  modelTitle: string;
  area: string;
  workshop: string;
  monthName: string;
  baseVolume: number; // default 17500
  efficiency: number; // default 0.70 (70%)
  weeks: string[]; // ['1W', '2W', '3W', '4W']
  roundingMode: 'round' | 'ceil' | 'floor' | 'exact';
  activeSectionId: PlantSectionId;
}

export interface CalculatedRow {
  lineSegment: LineSegment;
  productId: string;
  productName: string;
  cycleTime: number;
  orders: Record<string, number>;
  shares: Record<string, number>; // percentage (0-100)
}

export interface SegmentSummary {
  lineSegment: LineSegment;
  weightedHours: Record<string, number>; // week -> seconds
  uph: Record<string, number>; // week -> UPH
  rawManpower: Record<string, number>; // week -> exact float
  manpower: Record<string, number>; // week -> rounded integer
  avgManpower: number; // average across weeks
  rawAvgManpower: number;
}

export interface TableTotals {
  orders: Record<string, number>;
  shares: Record<string, number>;
  weightedHours: Record<string, number>;
  uph: Record<string, number>;
  manpower: Record<string, number>;
  avgManpower: number;
  totalProductionUnits: Record<string, number>; // 1W, 2W...
}
