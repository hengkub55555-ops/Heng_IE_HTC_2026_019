import React from 'react';
import { CalculationSettings } from '../types/manpower';
import { X, Sliders, RotateCcw } from 'lucide-react';

interface ParametersModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CalculationSettings;
  onSaveSettings: (settings: CalculationSettings) => void;
  onResetToDefault: () => void;
}

export const ParametersModal: React.FC<ParametersModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetToDefault,
}) => {
  if (!isOpen) return null;

  const [localSettings, setLocalSettings] = React.useState<CalculationSettings>({ ...settings });

  const handleSave = () => {
    onSaveSettings(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              ตั้งค่าพารามิเตอร์การคำนวณ (Calculation Parameters)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <div className="p-6 space-y-4 text-xs">
          {/* Base Volume */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ฐานปริมาณการผลิตต่อเดือน (Base Volume Denominator)
            </label>
            <input
              type="number"
              value={localSettings.baseVolume}
              onChange={(e) =>
                setLocalSettings({ ...localSettings, baseVolume: parseFloat(e.target.value) || 17500 })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              ใช้คำนวณสัดส่วน % ยอดผลิตแต่ละสัปดาห์ (มาตรฐานในเอกสารคือ 17,500 ชิ้น)
            </p>
          </div>

          {/* Line Efficiency / OEE */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ประสิทธิภาพไลน์การผลิต (Line Efficiency / OEE)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.50"
                max="1.00"
                step="0.01"
                value={localSettings.efficiency}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, efficiency: parseFloat(e.target.value) || 0.7 })
                }
                className="flex-1 accent-blue-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-sm text-blue-700 w-14 text-right">
                {(localSettings.efficiency * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              ค่ามาตรฐานอุตสาหกรรมในโมเดลนี้คือ 70% (0.70)
            </p>
          </div>

          {/* Rounding Mode */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              วิธีปัดเศษจำนวนคน (Headcount Rounding Rule)
            </label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { id: 'round', label: 'ปัดตามมาตรฐาน (Round)' },
                { id: 'ceil', label: 'ปัดขึ้นเสมอ (Ceil)' },
                { id: 'floor', label: 'ปัดลงเสมอ (Floor)' },
                { id: 'exact', label: 'ทศนิยม 2 ตำแหน่ง (Exact)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setLocalSettings({
                      ...localSettings,
                      roundingMode: opt.id as any,
                    })
                  }
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    localSettings.roundingMode === opt.id
                      ? 'border-blue-500 bg-blue-50 text-blue-800 font-semibold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metadata labels */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">พื้นที่ (Area)</label>
              <input
                type="text"
                value={localSettings.area}
                onChange={(e) => setLocalSettings({ ...localSettings, area: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ช็อป/ฝ่าย (Workshop)</label>
              <input
                type="text"
                value={localSettings.workshop}
                onChange={(e) => setLocalSettings({ ...localSettings, workshop: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={() => {
              onResetToDefault();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>คืนค่าเริ่มต้นเอกสาร</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
