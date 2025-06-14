import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useResources } from '../contexts/ResourceContext';
import { 
  PlusIcon, 
  SunIcon, 
  MoonIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const Header = ({ onCreateNew, currentView }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const { exportToCSV, importFromCSV } = useResources();

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importFromCSV(file);
      // Reset input
      event.target.value = '';
    }
  };

  return (
    <header className="bg-primary border-b border-primary shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RM</span>
              </div>
              <h1 className="text-xl font-semibold text-primary">
                Resource Manager
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Import/Export buttons - only show in list view */}
            {currentView === 'list' && (
              <>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImport}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title="Import CSV"
                  />
                  <button className="btn btn-secondary btn-sm flex items-center gap-2">
                    <ArrowUpTrayIcon className="w-4 h-4" />
                    Import
                  </button>
                </div>
                
                <button
                  onClick={exportToCSV}
                  className="btn btn-secondary btn-sm flex items-center gap-2"
                  title="Export CSV"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export
                </button>
              </>
            )}

            {/* Create New button - only show in list view */}
            {currentView === 'list' && (
              <button
                onClick={onCreateNew}
                className="btn btn-primary flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Add Resource
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary p-2"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;