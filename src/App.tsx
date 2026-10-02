import React, { useState, useMemo, useEffect } from 'react';
import {
  ALL_LINE_SEGMENTS,
  DEFAULT_PRODUCTS,
  DEFAULT_WEEKLY_ORDERS,
  DEFAULT_SETTINGS,
} from './data/initialData';
import { calculateManpower } from './utils/calculator';
import { exportManpowerToExcel } from './utils/excelExporter';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { MasterTable } from './components/MasterTable';
import { ManpowerCharts } from './components/ManpowerCharts';
import { ParametersModal } from './components/ParametersModal';
import { OriginalImageModal } from './components/OriginalImageModal';
import { FormulaGuideModal } from './components/FormulaGuideModal';
import { ManualOverrides, PlantSectionId, ShareRatioFormulaMode } from './types/manpower';
import { Table, BarChart3, Download, CheckCircle2, HelpCircle, Save, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'manpower_sizing_state_v2';

export default function App() {
  // Initialize from localStorage if present
  const [lineSegments, setLineSegments] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_segments`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return ALL_LINE_SEGMENTS;
  });

  const [products] = useState(DEFAULT_PRODUCTS);

  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_orders`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_WEEKLY_ORDERS;
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SETTINGS;
  });

  // Manual headcount & AVG overrides state
  const [manualOverrides, setManualOverrides] = useState<ManualOverrides>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_manual_overrides`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return { manpower: {}, avg: {} };
  });

  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'compare'>('table');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOriginalImageOpen, setIsOriginalImageOpen] = useState(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_segments`, JSON.stringify(lineSegments));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_manual_overrides`, JSON.stringify(manualOverrides));
    } catch (err) {
      console.error('Failed to auto-save to localStorage:', err);
    }
  }, [lineSegments, orders, settings, manualOverrides]);

  // Recalculate whenever inputs or active section change
  const result = useMemo(() => {
    return calculateManpower(lineSegments, products, orders, settings, manualOverrides);
  }, [lineSegments, products, orders, settings, manualOverrides]);

  // Update order quantity
  const handleUpdateOrder = (productId: string, week: string, value: number) => {
    setOrders((prev: any) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [week]: Math.max(0, value),
      },
    }));
  };

  // Update product cycle time
  const handleUpdateCycleTime = (segmentId: string, productId: string, value: number) => {
    setLineSegments((prev: any) =>
      prev.map((seg: any) => {
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

  // Update UPH
  const handleUpdateUph = (segmentId: string, value: number) => {
    setLineSegments((prev: any) =>
      prev.map((seg: any) => {
        if (seg.id === segmentId) {
          return { ...seg, uph: Math.max(1, value) };
        }
        return seg;
      })
    );
  };

  // Update Manpower for a specific segment and week (Editable directly on Web)
  const handleUpdateManpower = (segmentId: string, week: string, value: number) => {
    const cleanVal = Math.max(0, value);
    setManualOverrides((prev) => ({
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

  // Update AVG Manpower for a specific segment (Editable directly on Web)
  const handleUpdateAvgManpower = (segmentId: string, value: number) => {
    const cleanVal = Math.max(0, value);
    setManualOverrides((prev) => ({
      ...prev,
      avg: {
        ...prev.avg,
        [segmentId]: cleanVal,
      },
    }));
  };

  // Update Line Segment Name (English & Thai)
  const handleUpdateSegmentName = (segmentId: string, name: string, thaiName: string) => {
    setLineSegments((prev: any) =>
      prev.map((seg: any) => {
        if (seg.id === segmentId) {
          return { ...seg, name, thaiName };
        }
        return seg;
      })
    );
  };

  // Reset a single segment's manual manpower overrides
  const handleResetSegmentManpower = (segmentId: string) => {
    setManualOverrides((prev) => {
      const nextManpower = { ...prev.manpower };
      delete nextManpower[segmentId];
      const nextAvg = { ...prev.avg };
      delete nextAvg[segmentId];
      return { manpower: nextManpower, avg: nextAvg };
    });
    setToastMessage('คืนค่ากำลังคนและ AVG ของสายการผลิตนี้เป็นสูตรคำนวณ IE เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset all manpower overrides back to formula
  const handleResetAllManpowerOverrides = () => {
    setManualOverrides({ manpower: {}, avg: {} });
    setToastMessage('คืนค่าตัวเลขกำลังคนและ AVG ทั้งหมดกลับเป็นค่าคำนวณตามสูตร IE เรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Change active section
  const handleChangeSection = (sectionId: PlantSectionId) => {
    setSettings((prev: any) => ({ ...prev, activeSectionId: sectionId }));
  };

  // Change Share Ratio Formula Mode
  const handleChangeShareRatioMode = (mode: ShareRatioFormulaMode) => {
    setSettings((prev: any) => ({ ...prev, shareRatioMode: mode }));
    setToastMessage(
      mode === 'total_weekly_volume'
        ? 'เปลี่ยนสูตร Share Ratio: หารยอด Volume ทั้งหมด (สัดส่วนรวม 100%) เรียบร้อยแล้ว'
        : mode === 'process_volume'
        ? 'เปลี่ยนสูตร Share Ratio: หารยอดรวมของแต่ละ Process เรียบร้อยแล้ว'
        : 'เปลี่ยนสูตร Share Ratio: หารฐานความจุ 17,500 ชิ้น เรียบร้อยแล้ว'
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Save explicitly to storage
  const handleSaveToStorage = () => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_segments`, JSON.stringify(lineSegments));
      localStorage.setItem(`${STORAGE_KEY}_orders`, JSON.stringify(orders));
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
      localStorage.setItem(`${STORAGE_KEY}_manual_overrides`, JSON.stringify(manualOverrides));
      setToastMessage('บันทึกข้อมูลทุกตัวเลข (Order, เวลา, กำลังคน, AVG) ลงหน่วยความจำเรียบร้อยแล้ว');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e) {
      alert('ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Reset to original factory data
  const handleResetData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_segments`);
    localStorage.removeItem(`${STORAGE_KEY}_orders`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_manual_overrides`);
    setLineSegments(ALL_LINE_SEGMENTS);
    setOrders(DEFAULT_WEEKLY_ORDERS);
    setSettings(DEFAULT_SETTINGS);
    setManualOverrides({ manpower: {}, avg: {} });
    setToastMessage('คืนค่าข้อมูลเริ่มต้นตามภาพเอกสารทั้งหมดเรียบร้อยแล้ว');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Export to Excel
  const handleExportExcel = () => {
    try {
      const fileName = `Thailand_Factory_Manpower_Model_LineB_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportManpowerToExcel(lineSegments, products, orders, settings, fileName, manualOverrides);
      setToastMessage(`ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว (ครอบคลุมทั้งตารางหลัก ตารางสรุป และตัวเลขที่แก้ไข): ${fileName}`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Failed to export Excel:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel');
    }
  };

  // Filtered segments for current active section view
  const currentSectionSegments = useMemo(() => {
    if (settings.activeSectionId === 'all') return lineSegments;
    return lineSegments.filter((s: any) => s.sectionId === settings.activeSectionId);
  }, [lineSegments, settings.activeSectionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-['Plus_Jakarta_Sans','Sarabun',sans-serif]">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportExcel={handleExportExcel}
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
              <span>{settings.area}</span>
              <span aria-hidden="true">·</span>
              <span>{settings.workshop}</span>
              <span aria-hidden="true">·</span>
              <span className="text-blue-600 font-semibold">{settings.monthName}</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              {settings.modelTitle}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">
              ระบบวิเคราะห์และคำนวณอัตรากำลังคนมาตรฐานฝ่ายผลิต (IE Manpower Planning Model)
              พร้อมสูตรคำนวณจากเวลามาตรฐาน (ST) แถวรวมยอดแต่ละ Process และลิงก์สัดส่วน Share Ratio อัตโนมัติ
            </p>
          </div>

          {/* Quick Actions / Tabs */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsFormulaModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <span>สูตรคำนวณกำลังคน</span>
            </button>

            <button
              onClick={handleSaveToStorage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4 text-blue-600" />
              <span>บันทึกข้อมูล</span>
            </button>

            {/* Quick Tab Segmented Control */}
            <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
              <button
                onClick={() => setActiveTab('table')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
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
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === 'charts'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                <span>สรุปผลด้วยกราฟ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Top KPI Metric Cards */}
        <MetricCards result={result} settings={settings} />

        {/* Tab 1: Master Calculation Table */}
        {activeTab === 'table' && (
          <div className="space-y-6">
            <MasterTable
              result={result}
              lineSegments={currentSectionSegments}
              products={products}
              orders={orders}
              settings={settings}
              manualOverrides={manualOverrides}
              onUpdateOrder={handleUpdateOrder}
              onUpdateCycleTime={handleUpdateCycleTime}
              onUpdateUph={handleUpdateUph}
              onUpdateManpower={handleUpdateManpower}
              onUpdateAvgManpower={handleUpdateAvgManpower}
              onUpdateSegmentName={handleUpdateSegmentName}
              onResetSegmentManpower={handleResetSegmentManpower}
              onResetAllManpowerOverrides={handleResetAllManpowerOverrides}
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
                  <h3 className="text-sm font-bold">ต้องการนำข้อมูลไปใช้งานต่อในโปรแกรม Excel หรือนำเสนอผู้บริหาร?</h3>
                  <p className="text-xs text-blue-200 mt-0.5">
                    ไฟล์ Excel ประกอบด้วย 3 Sheet ครอบคลุมทั้งสองแผ่นงานเอกสาร พร้อมช่อง SUM รวมแต่ละ Process และสูตรคำนวณครบถ้วน
                  </p>
                </div>
              </div>
              <button
                onClick={handleExportExcel}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-sm whitespace-nowrap self-start sm:self-auto"
              >
                ดาวน์โหลดไฟล์ Excel (.xlsx) ทันที
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Charts & Visual Analytics */}
        {activeTab === 'charts' && (
          <ManpowerCharts
            result={result}
            lineSegments={currentSectionSegments}
            settings={settings}
            onChangeSection={handleChangeSection}
            onUpdateManpower={handleUpdateManpower}
            onUpdateAvgManpower={handleUpdateAvgManpower}
            onUpdateSegmentName={handleUpdateSegmentName}
            onUpdateUph={handleUpdateUph}
            onResetManpowerOverrides={handleResetAllManpowerOverrides}
            onResetSegmentManpower={handleResetSegmentManpower}
            onSaveData={handleSaveToStorage}
            manualOverrides={manualOverrides}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">泰国工厂标准定编测算模型</span>
            <span aria-hidden="true">·</span>
            <span>Thailand Factory Headcount Sizing System (LineB CAB)</span>
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
        settings={settings}
        onSaveSettings={setSettings}
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
        result={result}
        lineSegments={lineSegments}
        products={products}
        orders={orders}
        settings={settings}
      />
    </div>
  );
}
