import React from 'react';
import { X, Save } from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg mx-4 border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Settings</h3>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* General */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 uppercase tracking-wider">General</h4>
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 cursor-pointer hover:border-primary-300 dark:hover:border-slate-600 transition-colors">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-download processed files</span>
              <div className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.autoDownload}
                  onChange={(e) => updateSetting('autoDownload', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </div>
            </label>
          </div>

          {/* Defaults */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 uppercase tracking-wider">Default Configuration</h4>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 space-y-5">
              
              {/* Output Format Default */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Format</label>
                <div className="flex space-x-2">
                  {(['image/webp', 'image/jpeg', 'image/png'] as const).map(fmt => (
                     <button
                        key={fmt}
                        onClick={() => updateSetting('defaultOutputFormat', fmt)}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          settings.defaultOutputFormat === fmt
                            ? 'bg-white dark:bg-slate-700 border-primary-500 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        {fmt.split('/')[1].toUpperCase()}
                      </button>
                  ))}
                </div>
              </div>

               {/* Quality Default */}
               <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Quality</label>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{settings.defaultQuality}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.defaultQuality}
                  onChange={(e) => updateSetting('defaultQuality', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500"
                />
              </div>

              <hr className="border-slate-200 dark:border-slate-700" />

              {/* Resize Mode Default */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Resize Mode</label>
                <div className="flex space-x-2">
                  {(['none', 'percentage', 'dimensions'] as const).map((mode) => (
                     <button
                        key={mode}
                        onClick={() => updateSetting('defaultResizeMode', mode)}
                        className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          settings.defaultResizeMode === mode
                            ? 'bg-white dark:bg-slate-700 border-primary-500 text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        {mode === 'none' ? 'None' : mode === 'percentage' ? 'Percentage' : 'Fixed'}
                      </button>
                  ))}
                </div>
              </div>
              
              {/* Resize Percentage Default */}
              <div>
                 <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Resize %</label>
                  <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">{settings.defaultResizePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.defaultResizePercentage}
                  onChange={(e) => updateSetting('defaultResizePercentage', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="flex items-center px-5 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;