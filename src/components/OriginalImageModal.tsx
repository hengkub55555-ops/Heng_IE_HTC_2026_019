import React, { useState } from 'react';
import { X, ZoomIn, Image as ImageIcon } from 'lucide-react';

interface OriginalImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalImageModal: React.FC<OriginalImageModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [activeSheet, setActiveSheet] = useState<'sheet2' | 'sheet1'>('sheet2');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                เอกสารอ้างอิงต้นฉบับ: 泰国工厂标准定编测算模型
              </h3>
              <p className="text-xs text-slate-500">
                (Thailand Factory Standard Headcount Sizing Model - Reference Sheets)
              </p>
            </div>
          </div>

          {/* Toggle between Sheets */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveSheet('sheet2')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSheet === 'sheet2'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              แผ่นที่ 2: ขึ้นรูป & โฟม (Rooling, Inner Box, Cab per, PU Foam)
            </button>
            <button
              onClick={() => setActiveSheet('sheet1')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeSheet === 'sheet1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              แผ่นที่ 1: ประกอบ & ท้ายไลน์ (System, Assembly, Cooling, Final, Packing)
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Content */}
        <div className="flex-1 overflow-auto p-4 bg-slate-900/5 flex items-center justify-center">
          <img
            src="/image.png"
            alt="Reference Document"
            className="max-w-full h-auto rounded-lg shadow-md border border-slate-200 object-contain"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs text-slate-600">
          <span>* ข้อมูลทั้งสองแผ่นงานถูกบรรจุลงในระบบคำนวณและสามารถ Export ออกเป็น Excel ได้อย่างสมบูรณ์แบบ</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
