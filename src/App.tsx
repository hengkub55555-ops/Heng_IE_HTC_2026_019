import React, { useState, useMemo } from 'react';
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
import { PlantSectionId } from './types/manpower';
import { Table, BarChart3, Download, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [lineSegments, setLineSegments] = useState(ALL_LINE_SEGMENTS);
  const [products] = useState(DEFAULT_PRODUCTS);
  const [orders, setOrders] = useState(DEFAULT_WEEKLY_ORDERS);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [activeTab, setActiveTab] = useState<'table' | 'charts' | 'compare'>('table');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOriginalImageOpen, setIsOriginalImageOpen] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  // Recalculate whenever inputs or active section change
  const result = useMemo(() => {
    return calculateManpower(lineSegments, products, orders, settings);
  }, [lineSegments, products, orders, settings]);

  // Update order quantity
  const handleUpdateOrder = (productId: string, week: string, value: number) => {
    setOrders((prev) => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [week]: Math.max(0, value),
      },
    }));
  };

  // Update product cycle time
  const handleUpdateCycleTime = (segmentId: string, productId: string, value: number) => {
    setLineSegments((prev) =>
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

  // Update UPH
  const handleUpdateUph = (segmentId: string, value: number) => {
    setLineSegments((prev) =>
      prev.map((seg) => {
        if (seg.id === segmentId) {
          return { ...seg, uph: Math.max(1, value) };
        }
        return seg;
      })
    );
  };

  // Change active section
  const handleChangeSection = (sectionId: PlantSectionId) => {
    setSettings((prev) => ({ ...prev, activeSectionId: sectionId }));
  };

  // Reset to original data
  const handleResetData = () => {
    setLineSegments(ALL_LINE_SEGMENTS);
    setOrders(DEFAULT_WEEKLY_ORDERS);
    setSettings(DEFAULT_SETTINGS);
  };

  // Export to Excel (Generates multi-sheet workbook with both sections and total summary)
  const handleExportExcel = () => {
    try {
      const fileName = `Thailand_Factory_Manpower_Model_LineB_${new Date().toISOString().slice(0, 10)}.xlsx`;
      exportManpowerToExcel(lineSegments, products, orders, settings, fileName);
      setExportNotification(`ดาวน์โหลดไฟล์ Excel เรียบร้อยแล้ว (ครอบคลุมทั้ง 2 แผ่นงานและสรุปผล): ${fileName}`);
      setTimeout(() => setExportNotification(null), 5000);
    } catch (err) {
      console.error('Failed to export Excel:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด Excel');
    }
  };

  // Filtered segments for current active section view
  const currentSectionSegments = useMemo(() => {
    if (settings.activeSectionId === 'all') return lineSegments;
    return lineSegments.filter((s) => s.sectionId === settings.activeSectionId);
  }, [lineSegments, settings.activeSectionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportExcel={handleExportExcel}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenOriginalImage={() => setIsOriginalImageOpen(true)}
      />

      {/* Export Notification Toast */}
      {exportNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-medium">{exportNotification}</span>
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
              ครอบคลุมทั้งสายงานขึ้นรูป-โฟม (7 สาย) และสายงานประกอบ-ท้ายไลน์ (5 สาย)
            </p>
          </div>

          {/* Quick Tab Segmented Control */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
              onUpdateOrder={handleUpdateOrder}
              onUpdateCycleTime={handleUpdateCycleTime}
              onUpdateUph={handleUpdateUph}
              onResetData={handleResetData}
              onChangeSection={handleChangeSection}
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
                    ไฟล์ Excel ประกอบด้วย 3 Sheet ครอบคลุมทั้งสองแผ่นงานเอกสาร (ขึ้นรูป-โฟม, ประกอบ-ท้ายไลน์ และสรุปภาพรวม)
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
            <span>สูตรมาตรฐาน Industrial Engineering (IE)</span>
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
    </div>
  );
}
