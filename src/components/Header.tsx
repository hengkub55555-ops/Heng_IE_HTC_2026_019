import React from 'react';
import { Download, Sliders, Image as ImageIcon, Printer, HelpCircle, Save } from 'lucide-react';

export type AppTab = 'table' | 'bline_allocation' | 'aline_allocation' | 'comparison' | 'charts';

interface HeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
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
              WorkforceIE <span className="font-normal text-slate-500">· Plant Manpower Sizing</span>
            </span>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 text-xs lg:text-sm font-medium">
            <button
              onClick={() => setActiveTab('bline_allocation')}
              className={`transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'bline_allocation'
                  ? 'border-indigo-600 text-indigo-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>จัดสรรกำลังคน Line B</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 text-indigo-800 font-bold">
                12 สาย
              </span>
            </button>

            <button
              onClick={() => setActiveTab('aline_allocation')}
              className={`transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'aline_allocation'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>จัดสรรกำลังคน Line A</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-bold">
                10 สาย
              </span>
            </button>

            <button
              onClick={() => setActiveTab('comparison')}
              className={`transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                activeTab === 'comparison'
                  ? 'border-emerald-600 text-emerald-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>เปรียบเทียบ Line A vs B</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`transition-colors pb-1 border-b-2 ${
                activeTab === 'table'
                  ? 'border-slate-800 text-slate-900 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              ตารางคำนวณหลัก (IE Master Table)
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`transition-colors pb-1 border-b-2 ${
                activeTab === 'charts'
                  ? 'border-purple-600 text-purple-700 font-bold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              กราฟและสัดส่วน
            </button>

            <button
              onClick={onOpenFormulaGuide}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1 font-semibold"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>สูตรคำนวณ</span>
            </button>
            <button
              onClick={onOpenOriginalImage}
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>ภาพต้นฉบับ</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>ตั้งค่า</span>
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
        <div className="flex xl:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('bline_allocation')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'bline_allocation' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600'}`}
          >
            Line B
          </button>
          <button
            onClick={() => setActiveTab('aline_allocation')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'aline_allocation' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600'}`}
          >
            Line A
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'comparison' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600'}`}
          >
            เปรียบเทียบ
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'table' ? 'bg-slate-100 text-slate-900 font-bold' : 'text-slate-600'}`}
          >
            ตารางคำนวณ
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'charts' ? 'bg-purple-50 text-purple-700 font-bold' : 'text-slate-600'}`}
          >
            กราฟ
          </button>
        </div>
      </div>
    </header>
  );
};
