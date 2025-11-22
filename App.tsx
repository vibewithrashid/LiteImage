import React, { useState, useEffect } from 'react';
import { Layers, Image as ImageIcon, Moon, Sun, Settings } from 'lucide-react';
import Compressor from './views/Compressor';
import Resizer from './views/Resizer';
import SettingsModal from './components/SettingsModal';
import { AppSettings, DEFAULT_SETTINGS } from './types';

type Tab = 'compress' | 'resize';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('compress');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 transition-colors duration-200">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">LiteImage <span className="text-primary-600 dark:text-primary-400 font-medium text-sm bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full ml-1">Local</span></h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              Privacy first • 100% Client-side
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-10">
          <div className="bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm inline-flex transition-colors duration-200">
            <button
              onClick={() => setActiveTab('compress')}
              className={`
                flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === 'compress' 
                  ? 'bg-primary-50 dark:bg-slate-700 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-primary-200 dark:ring-slate-600' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
              `}
            >
              <Layers className="w-4 h-4 mr-2" />
              Compress & WebP
            </button>
            <button
              onClick={() => setActiveTab('resize')}
              className={`
                flex items-center px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ml-2
                ${activeTab === 'resize' 
                  ? 'bg-primary-50 dark:bg-slate-700 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-primary-200 dark:ring-slate-600' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
              `}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              Resize Dimensions
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'compress' ? (
            <Compressor settings={settings} />
          ) : (
            <Resizer settings={settings} />
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 w-full bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-3 text-center text-slate-400 dark:text-slate-500 text-xs transition-colors duration-200 z-0">
         Works offline. Images never leave your device.
      </footer>
    </div>
  );
};

export default App;