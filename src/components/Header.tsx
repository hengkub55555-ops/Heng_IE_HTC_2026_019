import React from 'react';
import { Download, Sliders, Image as ImageIcon, Printer, HelpCircle, Save } from 'lucide-react';

interface HeaderProps {
  activeTab: 'table' | 'charts' | 'compare';
  setActiveTab: (tab: 'table' | 'charts' | 'compare') => void;
  onExportExcel: () => void;
  onOpenSettings: () => void;
  onOpenOriginalImage: () => void;
  onOpenFormulaGuide: () => void;
  onSaveData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportExcel,
  onOpenSettings,
  onOpenOriginalImage,
  onOpenFormulaGuide,
  onSaveData,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              WorkforceIE <span className="font-normal text-slate-500">· Manpower Sizing</span>
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <button
              onClick={() => setActiveTab('table')}
              className={`transition-colors pb-1 border-b-2 ${
                activeTab === 'table'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              ตารางคำนวณ (Calculation Model)
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`transition-colors pb-1 border-b-2 ${
                activeTab === 'charts'
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              สรุปผลและกราฟ (Analytics & Charts)
            </button>
            <button
              onClick={onOpenFormulaGuide}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1.5 font-semibold"
            >
              <HelpCircle className="w-4 h-4" />
              <span>สูตรคำนวณกำลังคน</span>
            </button>
            <button
              onClick={onOpenOriginalImage}
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>ภาพต้นฉบับ</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4" />
              <span>ตั้งค่าพารามิเตอร์</span>
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onSaveData}
              title="บันทึกข้อมูลทั้งหมดลงเว็บ"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <Save className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">บันทึกข้อมูล</span>
            </button>
            <button
              onClick={() => window.print()}
              title="พิมพ์รายงาน"
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์</span>
            </button>
            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-2.5 py-1 rounded ${activeTab === 'table' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}`}
          >
            ตารางคำนวณ
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-2.5 py-1 rounded ${activeTab === 'charts' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600'}`}
          >
            กราฟ
          </button>
          <button
            onClick={onOpenFormulaGuide}
            className="text-blue-600 px-2 py-1 font-semibold"
          >
            สูตรคำนวณ
          </button>
          <button
            onClick={onSaveData}
            className="text-slate-700 px-2 py-1 font-semibold"
          >
            บันทึก
          </button>
          <button
            onClick={onOpenSettings}
            className="text-slate-600 px-2 py-1"
          >
            ตั้งค่า
          </button>
        </div>
      </div>
    </header>
  );
};
