import React from 'react';
import { ActiveTab } from '../types';
import { Volume2, VolumeX, BellRing, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  activeAlarmsCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  unreadAlertsCount: number;
  currentTimeStr: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  activeAlarmsCount,
  isMuted,
  onToggleMute,
  unreadAlertsCount,
  currentTimeStr,
}) => {
  const navItems: { id: ActiveTab; label: string; badge?: number }[] = [
    { id: 'attendance', label: 'Period Register' },
    { id: 'timetable', label: 'Weekly Timetable' },
    { id: 'biometric', label: 'Biometric Kiosk' },
    { id: 'sensors', label: 'Desk Sensors', badge: activeAlarmsCount > 0 ? activeAlarmsCount : undefined },
    { id: 'notifications', label: 'Parent Alerts', badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined },
    { id: 'reports', label: 'Trends & Reports' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onTabChange('attendance')}
              className="text-left group flex items-center gap-2.5 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
                AI
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                  AttendIQ
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight font-medium">
                  Academic Attendance &amp; Sensor Network
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        item.id === 'sensors'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 animate-pulse'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Zone */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-3">
              <span>Period 3 Active</span>
              <span aria-hidden="true">·</span>
              <span>{currentTimeStr}</span>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Sound Alarms Muted (Click to un-mute)' : 'Sound Alarms Active (Click to mute)'}
              className={`p-2 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isMuted
                  ? 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  : 'border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline text-xs">
                {isMuted ? 'Muted' : 'Audio Armed'}
              </span>
            </button>

            {/* Quick Action: Sensor Status button */}
            {activeAlarmsCount > 0 ? (
              <button
                onClick={() => onTabChange('sensors')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-sm animate-pulse"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>{activeAlarmsCount} Vacant Alarm{activeAlarmsCount > 1 ? 's' : ''}</span>
              </button>
            ) : (
              <button
                onClick={() => onTabChange('biometric')}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Kiosk Check-In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto pb-2.5 pt-1 -mx-2 px-2 scrollbar-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {item.label}
              {item.badge !== undefined && item.badge > 0 && ` (${item.badge})`}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
