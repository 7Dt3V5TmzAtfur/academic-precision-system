import React from 'react';
import { 
  Network, 
  Type, 
  BrainCircuit, 
  Archive, 
  ClipboardCheck, 
  History, 
  Settings, 
  Plus, 
  Cog,
  GitBranch,
  BookMarked
} from 'lucide-react';
import type { TabId } from '../../App';

interface SidebarProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: 'workflow', icon: Network, label: '工作流枢纽' },
    { id: 'format', icon: Type, label: '排版设置' },
    { id: 'analysis', icon: BrainCircuit, label: 'AI 期刊分析' },
    { id: 'projects', icon: Archive, label: '项目管理' },
    { id: 'versions', icon: GitBranch, label: '排版版本管理' },
    { id: 'references', icon: BookMarked, label: '文献库管理' },
    { id: 'audit', icon: ClipboardCheck, label: '预导出审计' },
  ] as const;

  const bottomNavItems = [
    { id: 'logs', icon: History, label: '导出日志' },
    { id: 'settings', icon: Settings, label: '账户设置' },
  ] as const;

  return (
    <nav className="flex flex-col fixed left-0 top-0 h-full z-40 w-64 border-r border-[#E1E8E7] dark:border-slate-800 bg-[#F4F7F6] dark:bg-slate-950 transition-all duration-150 ease-in-out">
      {/* Header */}
      <div className="p-6 border-b border-[#E1E8E7] dark:border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-white shrink-0">
          <Cog size={18} />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#1A5276] dark:text-sky-300 tracking-tight">学术工匠</h1>
          <p className="text-xs text-slate-500 font-label-caps">V2.4 专业版</p>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4">
        <button className="w-full bg-[#1A5276] text-white rounded py-2 text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#123e59] transition-colors shadow-sm font-label-caps">
          <Plus size={18} />
          新建文档
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex-1 overflow-y-auto py-2 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 ease-in-out w-full font-label-caps ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-[#1A5276] dark:text-sky-400 border-r-4 border-[#1A5276]'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Footer Tabs */}
      <div className="border-t border-[#E1E8E7] dark:border-slate-800 p-2 flex flex-col gap-1">
        {bottomNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors duration-150 ease-in-out w-full font-label-caps ${
              activeTab === item.id 
                ? 'bg-white dark:bg-slate-900 text-[#1A5276] dark:text-sky-400 border-r-4 border-[#1A5276]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
