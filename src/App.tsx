import React, { useState, useMemo, useEffect } from 'react';
import {
  ALL_LINE_SEGMENTS,
  DEFAULT_PRODUCTS,
  DEFAULT_WEEKLY_ORDERS,
  DEFAULT_SETTINGS,
  DEFAULT_BLINE_INDIRECT_ROLES,
  DEFAULT_BLINE_SHIFT_SETTINGS,
} from './data/initialData';
import {
  LINE_A_PRODUCTS,
  LINE_A_SEGMENTS,
  LINE_A_WEEKLY_ORDERS,
  LINE_A_SETTINGS,
  LINE_A_INDIRECT_ROLES,
  LINE_A_SHIFT_SETTINGS,
} from './data/lineAData';
import { calculateManpower } from './utils/calculator';
import {
  exportManpowerToExcel,
  exportLineAToExcel,
  exportFactoryComparisonToExcel,
} from './utils/excelExporter';
import { Header, AppTab } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { MasterTable } from './components/MasterTable';
import { ManpowerCharts } from './components/ManpowerCharts';
import { BLineAllocationView } from './components/BLineAllocationView';
import { ALineAllocationView } from './components/ALineAllocationView';
import { LineComparisonView } from './components/LineComparisonView';
import { ParametersModal } from './components/ParametersModal';
import { OriginalImageModal } from './components/OriginalImageModal';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import {
  BLineIndirectRole,
  BLineShiftSettings,
  CalculationSettings,
  LineSegment,
  ManualOverrides,
  PlantSectionId,
  ShareRatioFormulaMode,
} from './types/manpower';
import {
  Table,
  BarChart3,
  Download,
  CheckCircle2,
  HelpCircle,
  Save,
  Briefcase,
  Layers,
  Building2,
} from 'lucide-react';

const STORAGE_KEY = 'manpower_sizing_state_v3';

export default function App() {
  // ==========================================
  // LINE B STATE (12 Line Segments)
  // ==========================================
  const [lineBSegments, setLineBSegments] = useState<LineSegment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_b_segments`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ALL_LINE_SEGMENTS;
  });

  const productsB = DEFAULT_PRODUCTS;

  const [ordersB, setOrdersB] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_b_orders`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_WEEKLY_ORDERS;
  });

  const [settingsB, setSettingsB] = useState<CalculationSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_b_settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  const [manualOverridesB, setManualOverridesB] = useState<ManualOverrides>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_b_manual_overrides`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { manpower: {}, avg: {} };
  });

  const [indirectRolesB, setIndirectRolesB] = useState<BLineIndirectRole[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_b_indirect_roles`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BLINE_INDIRECT_ROLES;
  });

  const [shiftSettingsB, setShiftSettingsB] = useState<BLineShiftSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_b_shift_settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_BLINE_SHIFT_SETTINGS;
  });

  // ==========================================
  // LINE A STATE (10 Line Segments)
  // ==========================================
  const [lineASegments, setLineASegments] = useState<LineSegment[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_a_segments`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return LINE_A_SEGMENTS;
  });

  const productsA = LINE_A_PRODUCTS;

  const [ordersA, setOrdersA] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_a_orders`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return LINE_A_WEEKLY_ORDERS;
  });

  const [settingsA, setSettingsA] = useState<CalculationSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_a_settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return LINE_A_SETTINGS;
  });

  const [manualOverridesA, setManualOverridesA] = useState<ManualOverrides>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_a_manual_overrides`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { manpower: {}, avg: {} };
  });

  const [indirectRolesA, setIndirectRolesA] = useState<BLineIndirectRole[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_a_indirect_roles`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return LINE_A_INDIRECT_ROLES;
  });

  const [shiftSettingsA, setShiftSettingsA] = useState<BLineShiftSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_a_shift_settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return LINE_A_SHIFT_SETTINGS;
  });

  // Active navigation tab & line selector
  const [activeTab, setActiveTab] = useState<AppTab>('bline_allocation');
  const [activeLine, setActiveLine] = useState<'line_b' | 'line_a'>('line_b');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOriginalImageOpen, setIsOriginalImageOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      // Line B
      localStorage.setItem(`${STORAGE_KEY}_b_segments`, JSON.stringify(lineBSegments));
      localStorage.setItem(`${STORAGE_KEY}_b_orders`, JSON.stringify(ordersB));
      localStorage.setItem(`${STORAGE_KEY}_b_settings`, JSON.stringify(settingsB));
      localStorage.setItem(`${STORAGE_KEY}_b_manual_overrides`, JSON.stringify(manualOverridesB));
      localStorage.setItem(`${STORAGE_KEY}_b_indirect_roles`, JSON.stringify(indirectRolesB));
      localStorage.setItem(`${STORAGE_KEY}_b_shift_settings`, JSON.stringify(shiftSettingsB));

      // Line A
      localStorage.setItem(`${STORAGE_KEY}_a_segments`, JSON.stringify(lineASegments));
      localStorage.setItem(`${STORAGE_KEY}_a_orders`, JSON.stringify(ordersA));
      localStorage.setItem(`${STORAGE_KEY}_a_settings`, JSON.stringify(settingsA));
      localStorage.setItem(`${STORAGE_KEY}_a_manual_overrides`, JSON.stringify(manualOverridesA));
      localStorage.setItem(`${STORAGE_KEY}_a_indirect_roles`, JSON.stringify(indirectRolesA));
      localStorage.setItem(`${STORAGE_KEY}_a_shift_settings`, JSON.stringify(shiftSettingsA));
    } catch (err) {
      console.error('Failed to auto-save to localStorage:', err);
    }
  }, [
    lineBSegments,
    ordersB,
    settingsB,
    manualOverridesB,
    indirectRolesB,
    shiftSettingsB,
    lineASegments,
    ordersA,
    settingsA,
    manualOverridesA,
    indirectRolesA,
    shiftSettingsA,
  ]);

  // Recalculate results for both lines
  const resultB = useMemo(() => {
    return calculateManpower(lineBSegments, productsB, ordersB, settingsB, manualOverridesB);
  }, [lineBSegments, productsB, ordersB, settingsB, manualOverridesB]);

  const resultA = useMemo(() => {
    return calculateManpower(lineASegments, productsA, ordersA, settingsA, manualOverridesA);
  }, [lineASegments, productsA, ordersA, settingsA, manualOverridesA]);

  // Current active dataset according to activeLine
  const currentResult = activeLine === 'line_b' ? resultB : resultA;
  const currentSegments = activeLine === 'line_b' ? lineBSegments : lineASegments;
  const currentProducts = activeLine === 'line_b' ? productsB : productsA;
  const currentOrders = activeLine === 'line_b' ? ordersB : ordersA;
  const currentSettings = activeLine === 'line_b' ? settingsB : settingsA;
  const currentManualOverrides = activeLine === 'line_b' ? manualOverridesB : manualOverridesA;

  // Filtered segments for Master Table
  const currentFilteredSegments = useMemo(() => {
    if (currentSettings.activeSectionId === 'all') return currentSegments;
    return currentSegments.filter((s) => s.sectionId === currentSettings.activeSectionId);
  }, [currentSegments, currentSettings.activeSectionId]);

  // ==========================================
  // HANDLERS FOR LINE B
  // ==========================================
  const handleUpdateOrderB = (productId: string, week: string, value: number) => {
    setOrdersB((prev: any) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [week]: Math.max(0, value),
      },
    }));
  };

  const handleUpdateCycleTimeB = (segmentId: string, productId: string, value: number) => {
    setLineBSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          return {
            ...seg,
            productCycleTimes: {
              ...seg.productCycleTimes,
              [productId]: Math.max(0, value),
            },
          };
        }
        return seg;
      })
    );
  };

  const handleUpdateUphB = (segmentId: string, value: number) => {
    setLineBSegments((prev) =>
      prev.map((seg) => (seg.id === segmentId ? { ...seg, uph: Math.max(1, value) } : seg))
    );
  };

  const handleUpdateManpowerB = (segmentId: string, week: string, value: number) => {
    const cleanVal = Math.max(0, value);
    setManualOverridesB((prev) => ({
      ...prev,
      manpower: {
        ...prev.manpower,
        [segmentId]: {
          ...(prev.manpower[segmentId] || {}),
          [week]: cleanVal,
        },
      },
    }));
  };

  const handleUpdateAvgManpowerB = (segmentId: string, value: number) => {
    const cleanVal = Math.max(0, value);
    setManualOverridesB((prev) => ({
      ...prev,
      avg: {
        ...prev.avg,
        [segmentId]: cleanVal,
      },
    }));
  };

  const handleUpdateSegmentNameB = (segmentId: string, name: string, thaiName: string) => {
    setLineBSegments((prev) =>
      prev.map((seg) => (seg.id === segmentId ? { ...seg, name, thaiName } : seg))
    );
  };

  const handleResetSegmentManpowerB = (segmentId: string) => {
    setManualOverridesB((prev) => {
      const nextManpower = { ...prev.manpower };
      delete nextManpower[segmentId];
      const nextAvg = { ...prev.avg };
      delete nextAvg[segmentId];
      return { manpower: nextManpower, avg: nextAvg };
    });
    setToastMessage('คืนค่ากำลังคนและ AVG ของสายการผลิต Line B นี้เป็นสูตรคำนวณ IE เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetAllManpowerOverridesB = () => {
    setManualOverridesB({ manpower: {}, avg: {} });
    setToastMessage('คืนค่าตัวเลขกำลังคนและ AVG ทั้งหมดของ Line B กลับเป็นสูตร IE เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateIndirectRoleB = (roleId: string, field: string, value: any) => {
    setIndirectRolesB((prev) =>
      prev.map((role) => (role.id === roleId ? { ...role, [field]: value } : role))
    );
  };

  const handleAddIndirectRoleB = () => {
    const newId = `role_b_${Date.now()}`;
    const newRole: BLineIndirectRole = {
      id: newId,
      roleName: 'ตำแหน่งใหม่ (New Support Role Line B)',
      roleThaiName: 'ระบุชื่อตำแหน่งงานภาษาไทย',
      category: 'support',
      headcount: { '1W': 1, '2W': 1, '3W': 1, '4W': 1 },
      avgHeadcount: 1,
      shift: 'ประจำไลน์ B',
      responsibilities: 'ระบุหน้าที่รับผิดชอบ',
    };
    setIndirectRolesB((prev) => [...prev, newRole]);
    setToastMessage('เพิ่มตำแหน่งงานสนับสนุน Line B เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteIndirectRoleB = (roleId: string) => {
    setIndirectRolesB((prev) => prev.filter((r) => r.id !== roleId));
    setToastMessage('ลบตำแหน่งงานสนับสนุน Line B เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateShiftSettingsB = (newSettings: Partial<BLineShiftSettings>) => {
    setShiftSettingsB((prev) => ({ ...prev, ...newSettings }));
    setToastMessage('อัปเดตการจัดกะและพารามิเตอร์ Line B เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ==========================================
  // HANDLERS FOR LINE A
  // ==========================================
  const handleUpdateOrderA = (productId: string, week: string, value: number) => {
    setOrdersA((prev: any) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [week]: Math.max(0, value),
      },
    }));
  };

  const handleUpdateCycleTimeA = (segmentId: string, productId: string, value: number) => {
    setLineASegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          return {
            ...seg,
            productCycleTimes: {
              ...seg.productCycleTimes,
              [productId]: Math.max(0, value),
            },
          };
        }
        return seg;
      })
    );
  };

  const handleUpdateUphA = (segmentId: string, value: number) => {
    setLineASegments((prev) =>
      prev.map((seg) => (seg.id === segmentId ? { ...seg, uph: Math.max(1, value) } : seg))
    );
  };

  const handleUpdateManpowerA = (segmentId: string, week: string, value: number) => {
    const cleanVal = Math.max(0, value);
    setManualOverridesA((prev) => ({
      ...prev,
      manpower: {
        ...prev.manpower,
        [segmentId]: {
          ...(prev.manpower[segmentId] || {}),
          [week]: cleanVal,
        },
      },
    }));
  };

  const handleUpdateAvgManpowerA = (segmentId: string, value: number) => {
    const cleanVal = Math.max(0, value);
    setManualOverridesA((prev) => ({
      ...prev,
      avg: {
        ...prev.avg,
        [segmentId]: cleanVal,
      },
    }));
  };

  const handleUpdateSegmentNameA = (segmentId: string, name: string, thaiName: string) => {
    setLineASegments((prev) =>
      prev.map((seg) => (seg.id === segmentId ? { ...seg, name, thaiName } : seg))
    );
  };

  const handleResetSegmentManpowerA = (segmentId: string) => {
    setManualOverridesA((prev) => {
      const nextManpower = { ...prev.manpower };
      delete nextManpower[segmentId];
      const nextAvg = { ...prev.avg };
      delete nextAvg[segmentId];
      return { manpower: nextManpower, avg: nextAvg };
    });
    setToastMessage('คืนค่ากำลังคนและ AVG ของสายการผลิต Line A นี้เป็นสูตรคำนวณ IE เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetAllManpowerOverridesA = () => {
    setManualOverridesA({ manpower: {}, avg: {} });
    setToastMessage('คืนค่าตัวเลขกำลังคนและ AVG ทั้งหมดของ Line A กลับเป็นสูตร IE เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateIndirectRoleA = (roleId: string, field: string, value: any) => {
    setIndirectRolesA((prev) =>
      prev.map((role) => (role.id === roleId ? { ...role, [field]: value } : role))
    );
  };

  const handleAddIndirectRoleA = () => {
    const newId = `role_a_${Date.now()}`;
    const newRole: BLineIndirectRole = {
      id: newId,
      roleName: 'ตำแหน่งใหม่ (New Support Role Line A)',
      roleThaiName: 'ระบุชื่อตำแหน่งงานภาษาไทย',
      category: 'support',
      headcount: { '1W': 1, '2W': 1, '3W': 1, '4W': 1 },
      avgHeadcount: 1,
      shift: 'ประจำไลน์ A',
      responsibilities: 'ระบุหน้าที่รับผิดชอบ',
    };
    setIndirectRolesA((prev) => [...prev, newRole]);
    setToastMessage('เพิ่มตำแหน่งงานสนับสนุน Line A เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteIndirectRoleA = (roleId: string) => {
    setIndirectRolesA((prev) => prev.filter((r) => r.id !== roleId));
    setToastMessage('ลบตำแหน่งงานสนับสนุน Line A เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateShiftSettingsA = (newSettings: Partial<BLineShiftSettings>) => {
    setShiftSettingsA((prev) => ({ ...prev, ...newSettings }));
    setToastMessage('อัปเดตการจัดกะและพารามิเตอร์ Line A เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Section & Mode change handlers
  const handleChangeSection = (sectionId: PlantSectionId) => {
    if (activeLine === 'line_b') {
      setSettingsB((prev) => ({ ...prev, activeSectionId: sectionId }));
    } else {
      setSettingsA((prev) => ({ ...prev, activeSectionId: sectionId }));
    }
  };

  const handleChangeShareRatioMode = (mode: ShareRatioFormulaMode) => {
    if (activeLine === 'line_b') {
      setSettingsB((prev) => ({ ...prev, shareRatioMode: mode }));
    } else {
      setSettingsA((prev) => ({ ...prev, shareRatioMode: mode }));
    }
    setToastMessage(
      mode === 'total_weekly_volume'
        ? 'เปลี่ยนสูตร Share Ratio: หารยอด Volume ทั้งหมด (สัดส่วนรวม 100%) เรียบร้อยแล้ว'
        : mode === 'process_volume'
        ? 'เปลี่ยนสูตร Share Ratio: หารยอดรวมของแต่ละ Process เรียบร้อยแล้ว'
        : 'เปลี่ยนสูตร Share Ratio: หารฐานความจุมาตรฐาน เรียบร้อยแล้ว'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Save explicitly to storage
  const handleSaveToStorage = () => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_b_segments`, JSON.stringify(lineBSegments));
      localStorage.setItem(`${STORAGE_KEY}_b_orders`, JSON.stringify(ordersB));
      localStorage.setItem(`${STORAGE_KEY}_b_settings`, JSON.stringify(settingsB));
      localStorage.setItem(`${STORAGE_KEY}_b_manual_overrides`, JSON.stringify(manualOverridesB));
      localStorage.setItem(`${STORAGE_KEY}_b_indirect_roles`, JSON.stringify(indirectRolesB));
      localStorage.setItem(`${STORAGE_KEY}_b_shift_settings`, JSON.stringify(shiftSettingsB));

      localStorage.setItem(`${STORAGE_KEY}_a_segments`, JSON.stringify(lineASegments));
      localStorage.setItem(`${STORAGE_KEY}_a_orders`, JSON.stringify(ordersA));
      localStorage.setItem(`${STORAGE_KEY}_a_settings`, JSON.stringify(settingsA));
      localStorage.setItem(`${STORAGE_KEY}_a_manual_overrides`, JSON.stringify(manualOverridesA));
      localStorage.setItem(`${STORAGE_KEY}_a_indirect_roles`, JSON.stringify(indirectRolesA));
      localStorage.setItem(`${STORAGE_KEY}_a_shift_settings`, JSON.stringify(shiftSettingsA));

      setToastMessage('บันทึกข้อมูลทุกตัวเลขของ Line A และ Line B เรียบร้อยแล้ว');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Reset to original factory data
  const handleResetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_b_segments`);
    localStorage.removeItem(`${STORAGE_KEY}_b_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_b_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_b_manual_overrides`);
    localStorage.removeItem(`${STORAGE_KEY}_b_indirect_roles`);
    localStorage.removeItem(`${STORAGE_KEY}_b_shift_settings`);

    localStorage.removeItem(`${STORAGE_KEY}_a_segments`);
    localStorage.removeItem(`${STORAGE_KEY}_a_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_a_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_a_manual_overrides`);
    localStorage.removeItem(`${STORAGE_KEY}_a_indirect_roles`);
    localStorage.removeItem(`${STORAGE_KEY}_a_shift_settings`);

    setLineBSegments(ALL_LINE_SEGMENTS);
    setOrdersB(DEFAULT_WEEKLY_ORDERS);
    setSettingsB(DEFAULT_SETTINGS);
    setManualOverridesB({ manpower: {}, avg: {} });
    setIndirectRolesB(DEFAULT_BLINE_INDIRECT_ROLES);
    setShiftSettingsB(DEFAULT_BLINE_SHIFT_SETTINGS);

    setLineASegments(LINE_A_SEGMENTS);
    setOrdersA(LINE_A_WEEKLY_ORDERS);
    setSettingsA(LINE_A_SETTINGS);
    setManualOverridesA({ manpower: {}, avg: {} });
    setIndirectRolesA(LINE_A_INDIRECT_ROLES);
    setShiftSettingsA(LINE_A_SHIFT_SETTINGS);

    setToastMessage('คืนค่าข้อมูลเริ่มต้นของโรงงานทั้งหมด (Line A & Line B) เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Export handlers
  const handleExportExcelB = () => {
    try {
      const fileName = `Thailand_Factory_Manpower_Model_LineB_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportManpowerToExcel(
        lineBSegments,
        productsB,
        ordersB,
        settingsB,
        fileName,
        manualOverridesB,
        indirectRolesB,
        shiftSettingsB
      );
      setToastMessage(`ดาวน์โหลดไฟล์ Excel Line B เรียบร้อยแล้ว: ${fileName}`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to export Excel Line B:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel Line B');
    }
  };

  const handleExportExcelA = () => {
    try {
      const fileName = `Thailand_Factory_Manpower_Model_LineA_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportLineAToExcel(
        lineASegments,
        productsA,
        ordersA,
        settingsA,
        fileName,
        manualOverridesA,
        indirectRolesA,
        shiftSettingsA
      );
      setToastMessage(`ดาวน์โหลดไฟล์ Excel Line A เรียบร้อยแล้ว: ${fileName}`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to export Excel Line A:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel Line A');
    }
  };

  const handleExportExcelFactory = () => {
    try {
      const fileName = `Thailand_Factory_Manpower_Comparison_LineA_vs_LineB_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportFactoryComparisonToExcel(
        {
          lineSegments: lineASegments,
          products: productsA,
          orders: ordersA,
          settings: settingsA,
          manualOverrides: manualOverridesA,
          indirectRoles: indirectRolesA,
          shiftSettings: shiftSettingsA,
        },
        {
          lineSegments: lineBSegments,
          products: productsB,
          orders: ordersB,
          settings: settingsB,
          manualOverrides: manualOverridesB,
          indirectRoles: indirectRolesB,
          shiftSettings: shiftSettingsB,
        },
        fileName
      );
      setToastMessage(`ดาวน์โหลดไฟล์ Excel เปรียบเทียบ Line A vs Line B เรียบร้อยแล้ว: ${fileName}`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to export factory comparison Excel:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel เปรียบเทียบ');
    }
  };

  const handleHeaderExport = () => {
    if (activeTab === 'aline_allocation' || activeLine === 'line_a') {
      handleExportExcelA();
    } else if (activeTab === 'comparison') {
      handleExportExcelFactory();
    } else {
      handleExportExcelB();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-['Plus_Jakarta_Sans','Sarabun',sans-serif]">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportExcel={handleHeaderExport}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOriginalImage={() => setIsOriginalImageOpen(true)}
        onOpenFormulaGuide={() => setIsFormulaModalOpen(true)}
        onSaveData={handleSaveToStorage}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb & Subtitle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span>โรงงานประเทศไทย (Thailand Plant)</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-blue-700">
                {activeTab === 'aline_allocation'
                  ? 'Line A (A-line)'
                  : activeTab === 'bline_allocation'
                  ? 'Line B (B-line)'
                  : activeTab === 'comparison'
                  ? 'Line A & Line B Factory Comparison'
                  : activeLine === 'line_a'
                  ? 'Line A'
                  : 'Line B'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 font-semibold">{currentSettings.monthName}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {activeTab === 'aline_allocation'
                ? 'ตารางจัดสรรกำลังคนและข้อมูลอื่นๆ ของ A-line'
                : activeTab === 'bline_allocation'
                ? 'ตารางจัดสรรกำลังคนและข้อมูลอื่นๆ ของ B-line'
                : activeTab === 'comparison'
                ? 'ระบบเปรียบเทียบและสรุปกำลังคนภาพรวมโรงงาน (Line A vs Line B)'
                : `${currentSettings.modelTitle} (${activeLine === 'line_b' ? 'Line B' : 'Line A'})`}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              ระบบวิเคราะห์และคำนวณอัตรากำลังคนมาตรฐานฝ่ายผลิต (IE Manpower Planning Model)
              ครอบคลุมทั้ง Line A (10 สายการผลิต 2 กะ) และ Line B (12 สายการผลิต 1 กะ + OT) พร้อมตารางจัดสรรและระบบเปรียบเทียบ
            </p>
          </div>

          {/* Quick Actions / Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsFormulaModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>สูตรคำนวณ</span>
            </button>

            <button
              onClick={handleSaveToStorage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 text-blue-600" />
              <span>บันทึกทั้งหมด</span>
            </button>

            {/* Main Tabs Segmented Control */}
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl overflow-x-auto">
              <button
                onClick={() => setActiveTab('bline_allocation')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'bline_allocation'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                <span>จัดสรรคน Line B</span>
              </button>
              <button
                onClick={() => setActiveTab('aline_allocation')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'aline_allocation'
                    ? 'bg-white text-blue-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                <span>จัดสรรคน Line A</span>
              </button>
              <button
                onClick={() => setActiveTab('comparison')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'comparison'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>เปรียบเทียบ A vs B</span>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3.5 h-3.5 text-blue-600" />
                <span>ตารางคำนวณหลัก</span>
              </button>
              <button
                onClick={() => setActiveTab('charts')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'charts'
                    ? 'bg-white text-purple-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                <span>กราฟ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Line Switcher Bar (Visible on Master Table and Charts) */}
        {(activeTab === 'table' || activeTab === 'charts') && (
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">เลือกสายการผลิตที่ต้องการดู / แก้ไข:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveLine('line_b')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    activeLine === 'line_b'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Line B (12 สายผลิต · 8 รุ่นโมเดล)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLine('line_a')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    activeLine === 'line_a'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Line A (10 สายผลิต · 7 รุ่นโมเดล)
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              กำลังแสดงข้อมูล: <strong className="text-slate-900">{activeLine === 'line_b' ? 'Line B CAB (12 Lines)' : 'Line A REF (10 Lines)'}</strong>
            </div>
          </div>
        )}

        {/* Top KPI Metric Cards */}
        {activeTab !== 'comparison' && (
          <div className="mb-6">
            <MetricCards
              result={
                activeTab === 'aline_allocation'
                  ? resultA
                  : activeTab === 'bline_allocation'
                  ? resultB
                  : currentResult
              }
              settings={
                activeTab === 'aline_allocation'
                  ? settingsA
                  : activeTab === 'bline_allocation'
                  ? settingsB
                  : currentSettings
              }
            />
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 1: LINE B ALLOCATION VIEW              */}
        {/* ========================================== */}
        {activeTab === 'bline_allocation' && (
          <BLineAllocationView
            result={resultB}
            lineSegments={lineBSegments}
            settings={settingsB}
            indirectRoles={indirectRolesB}
            shiftSettings={shiftSettingsB}
            manualOverrides={manualOverridesB}
            onUpdateManpower={handleUpdateManpowerB}
            onUpdateAvgManpower={handleUpdateAvgManpowerB}
            onUpdateSegmentName={handleUpdateSegmentNameB}
            onUpdateUph={handleUpdateUphB}
            onResetSegmentManpower={handleResetSegmentManpowerB}
            onResetAllManpowerOverrides={handleResetAllManpowerOverridesB}
            onUpdateIndirectRole={handleUpdateIndirectRoleB}
            onAddIndirectRole={handleAddIndirectRoleB}
            onDeleteIndirectRole={handleDeleteIndirectRoleB}
            onUpdateShiftSettings={handleUpdateShiftSettingsB}
            onSaveData={handleSaveToStorage}
            onExportExcel={handleExportExcelB}
          />
        )}

        {/* ========================================== */}
        {/* TAB 2: LINE A ALLOCATION VIEW              */}
        {/* ========================================== */}
        {activeTab === 'aline_allocation' && (
          <ALineAllocationView
            result={resultA}
            lineSegments={lineASegments}
            settings={settingsA}
            indirectRoles={indirectRolesA}
            shiftSettings={shiftSettingsA}
            manualOverrides={manualOverridesA}
            onUpdateManpower={handleUpdateManpowerA}
            onUpdateAvgManpower={handleUpdateAvgManpowerA}
            onUpdateSegmentName={handleUpdateSegmentNameA}
            onUpdateUph={handleUpdateUphA}
            onResetSegmentManpower={handleResetSegmentManpowerA}
            onResetAllManpowerOverrides={handleResetAllManpowerOverridesA}
            onUpdateIndirectRole={handleUpdateIndirectRoleA}
            onAddIndirectRole={handleAddIndirectRoleA}
            onDeleteIndirectRole={handleDeleteIndirectRoleA}
            onUpdateShiftSettings={handleUpdateShiftSettingsA}
            onSaveData={handleSaveToStorage}
            onExportExcel={handleExportExcelA}
          />
        )}

        {/* ========================================== */}
        {/* TAB 3: LINE COMPARISON VIEW (A vs B)       */}
        {/* ========================================== */}
        {activeTab === 'comparison' && (
          <LineComparisonView
            resultA={resultA}
            resultB={resultB}
            segmentsA={lineASegments}
            segmentsB={lineBSegments}
            settingsA={settingsA}
            settingsB={settingsB}
            indirectRolesA={indirectRolesA}
            indirectRolesB={indirectRolesB}
            shiftSettingsA={shiftSettingsA}
            shiftSettingsB={shiftSettingsB}
            onSelectLine={(lineId) => {
              if (lineId === 'line_a') {
                setActiveTab('aline_allocation');
                setActiveLine('line_a');
              } else {
                setActiveTab('bline_allocation');
                setActiveLine('line_b');
              }
            }}
            onExportExcel={handleExportExcelFactory}
          />
        )}

        {/* ========================================== */}
        {/* TAB 4: MASTER CALCULATION TABLE            */}
        {/* ========================================== */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <MasterTable
              result={currentResult}
              lineSegments={currentFilteredSegments}
              products={currentProducts}
              orders={currentOrders}
              settings={currentSettings}
              manualOverrides={currentManualOverrides}
              onUpdateOrder={activeLine === 'line_b' ? handleUpdateOrderB : handleUpdateOrderA}
              onUpdateCycleTime={activeLine === 'line_b' ? handleUpdateCycleTimeB : handleUpdateCycleTimeA}
              onUpdateUph={activeLine === 'line_b' ? handleUpdateUphB : handleUpdateUphA}
              onUpdateManpower={activeLine === 'line_b' ? handleUpdateManpowerB : handleUpdateManpowerA}
              onUpdateAvgManpower={activeLine === 'line_b' ? handleUpdateAvgManpowerB : handleUpdateAvgManpowerA}
              onUpdateSegmentName={activeLine === 'line_b' ? handleUpdateSegmentNameB : handleUpdateSegmentNameA}
              onResetSegmentManpower={activeLine === 'line_b' ? handleResetSegmentManpowerB : handleResetSegmentManpowerA}
              onResetAllManpowerOverrides={activeLine === 'line_b' ? handleResetAllManpowerOverridesB : handleResetAllManpowerOverridesA}
              onResetData={handleResetData}
              onChangeSection={handleChangeSection}
              onChangeShareRatioMode={handleChangeShareRatioMode}
              onSaveToStorage={handleSaveToStorage}
              onOpenFormulaGuide={() => setIsFormulaModalOpen(true)}
            />

            {/* Quick Export Banner */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-lg">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    ดาวน์โหลดรายงาน Excel สำหรับ {activeLine === 'line_b' ? 'Line B CAB' : 'Line A REF'}
                  </h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    ประกอบด้วยชีต Pre-Foaming, Assembly & Final, Executive Summary และตารางจัดสรรอัตรากำลังพลครบถ้วน
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={activeLine === 'line_b' ? handleExportExcelB : handleExportExcelA}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs whitespace-nowrap"
                >
                  Export {activeLine === 'line_b' ? 'Line B' : 'Line A'} (.xlsx)
                </button>
                <button
                  onClick={handleExportExcelFactory}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-lg transition-all shadow-xs whitespace-nowrap"
                >
                  Export ทั้งโรงงาน (A + B)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* TAB 5: CHARTS & VISUAL ANALYTICS           */}
        {/* ========================================== */}
        {activeTab === 'charts' && (
          <ManpowerCharts
            result={currentResult}
            lineSegments={currentFilteredSegments}
            settings={currentSettings}
            onChangeSection={handleChangeSection}
            onUpdateManpower={activeLine === 'line_b' ? handleUpdateManpowerB : handleUpdateManpowerA}
            onUpdateAvgManpower={activeLine === 'line_b' ? handleUpdateAvgManpowerB : handleUpdateAvgManpowerA}
            onUpdateSegmentName={activeLine === 'line_b' ? handleUpdateSegmentNameB : handleUpdateSegmentNameA}
            onUpdateUph={activeLine === 'line_b' ? handleUpdateUphB : handleUpdateUphA}
            onResetManpowerOverrides={activeLine === 'line_b' ? handleResetAllManpowerOverridesB : handleResetAllManpowerOverridesA}
            onResetSegmentManpower={activeLine === 'line_b' ? handleResetSegmentManpowerB : handleResetSegmentManpowerA}
            onSaveData={handleSaveToStorage}
            manualOverrides={currentManualOverrides}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">泰国工厂标准定编测算模型</span>
            <span aria-hidden="true">·</span>
            <span>Thailand Factory Workforce Sizing System (Line A & Line B)</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <button
              onClick={() => setIsFormulaModalOpen(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              สูตรการคำนวณกำลังคน
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-blue-600 hover:underline"
            >
              ตั้งค่าพารามิเตอร์
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsOriginalImageOpen(true)}
              className="text-blue-600 hover:underline"
            >
              ดูเอกสารต้นฉบับ
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <ParametersModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={currentSettings}
        onSaveSettings={(newSettings) => {
          if (activeLine === 'line_b') {
            setSettingsB(newSettings);
          } else {
            setSettingsA(newSettings);
          }
        }}
        onResetToDefault={handleResetData}
      />

      {/* Original Image Reference Modal */}
      <OriginalImageModal
        isOpen={isOriginalImageOpen}
        onClose={() => setIsOriginalImageOpen(false)}
      />

      {/* Formula Guide Modal */}
      <FormulaGuideModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        result={currentResult}
        lineSegments={currentSegments}
        products={currentProducts}
        orders={currentOrders}
        settings={currentSettings}
      />
    </div>
  );
}
