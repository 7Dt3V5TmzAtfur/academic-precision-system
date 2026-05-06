import React from 'react';
import { Bell, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import { TabId } from '../../App';

interface HeaderProps {
  activeTab: TabId;
}

export function Header({ activeTab }: HeaderProps) {
  const tabNames: Record<TabId, string> = {
    workflow: '工作流枢纽',
    format: '排版设置',
    analysis: 'AI 期刊分析',
    projects: '项目管理',
    audit: '预导出审计',
    logs: '导出日志',
    settings: '系统配置',
    versions: '版本管理',
    references: '文献管理'
  };

  const [showProfile, setShowProfile] = React.useState(false);

  return (
    <header className="flex justify-between items-center px-6 h-14 w-full sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-[#E1E8E7] dark:border-slate-800 font-sans tracking-tight transition-colors duration-200 shrink-0">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-[#1A5276] dark:text-sky-200 font-h1-title">
          学术文档处理系统
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <span className="text-slate-600 dark:text-slate-400 text-xs font-medium font-body-main bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          当前视图: <span className="text-[#1A5276] dark:text-sky-300 font-bold">{tabNames[activeTab]}</span>
        </span>
        <div className="flex items-center gap-2 relative">
          <button onClick={() => alert('通知：目前没有新的系统通知。')} className="w-8 h-8 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200" title="通知消息">
            <Bell size={18} />
          </button>
          <button onClick={() => alert('帮助：请查阅用户手册或联系技术支持获取帮助。')} className="w-8 h-8 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200" title="使用帮助">
            <HelpCircle size={18} />
          </button>
          <button onClick={() => alert('设置：全局系统设置暂不开放给普通用户修改。')} className="w-8 h-8 flex items-center justify-center rounded text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200" title="系统设置">
            <SettingsIcon size={18} />
          </button>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowProfile(!showProfile)} className="block w-8 h-8 rounded-full overflow-hidden border border-[#E1E8E7] shrink-0 bg-surface-container cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary">
            <img 
              referrerPolicy="no-referrer"
              alt="User profile" 
              className="w-full h-full object-cover" 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
            />
          </button>
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E1E8E7] rounded-lg shadow-lg z-50 py-1">
              <a href="#" onClick={(e) => { e.preventDefault(); alert('个人中心开发中...'); setShowProfile(false); }} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">个人中心</a>
              <a href="#" onClick={(e) => { e.preventDefault(); alert('正在退出登录...'); setShowProfile(false); }} className="block px-4 py-2 text-sm text-red-600 hover:bg-slate-50">退出登录</a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
