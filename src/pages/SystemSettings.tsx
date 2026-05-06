import React, { useState, useRef, useEffect } from 'react';
import { Settings, Save, RefreshCw, Bot, Monitor, Check } from 'lucide-react';

export function SystemSettings() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleTestConnection = () => {
    setIsTesting(true);
    setTestResult('idle');
    // Simulate network delay
    timeoutsRef.current.push(setTimeout(() => {
      setIsTesting(false);
      setTestResult('success');
      // Reset success message after a few seconds
      timeoutsRef.current.push(setTimeout(() => setTestResult('idle'), 3000));
    }, 1500));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate saving
    timeoutsRef.current.push(setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      timeoutsRef.current.push(setTimeout(() => setSaveSuccess(false), 3000));
    }, 800));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8 h-full pt-4">
      <header className="mb-8">
        <h1 className="text-[30px] font-bold text-on-background m-0">系统高级配置</h1>
        <p className="text-on-surface-variant mt-2 text-sm">管理您的 AI 处理参数和核心系统路径。</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4 border-b border-surface-container-low pb-4">
            <Bot className="text-primary" size={24} />
            <h2 className="text-[20px] font-semibold text-on-background m-0">AI 引擎配置</h2>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <label className="text-[13px] font-semibold text-on-surface uppercase tracking-wider" htmlFor="api-key">API 密钥 (OpenAI 兼容)</label>
              <input 
                id="api-key" 
                type="password" 
                defaultValue="ak_27v99L6QN8Ti7wD9r460c8Be1Dn74"
                className="w-full bg-white border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1" 
              />
              <p className="text-[12px] text-on-surface-variant mt-1 leading-snug">用于智能提取样式规则、生成语义分析和排版纠错建议。</p>
            </div>
            
            <div className="flex flex-col gap-1.5 p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <label className="text-[13px] font-semibold text-on-surface uppercase tracking-wider" htmlFor="base-url">代理服务器 (Base URL)</label>
              <input 
                id="base-url" 
                type="url" 
                defaultValue="https://api.longcat.chat/openai"
                className="w-full bg-white border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1" 
              />
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <label className="text-[13px] font-semibold text-on-surface uppercase tracking-wider" htmlFor="model-select">默认对话模型</label>
              <select 
                id="model-select"
                className="w-full bg-white border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1"
                defaultValue="longcat-flash-chat"
              >
                <option value="longcat-flash-chat">LongCat-Flash-Chat (推荐，快速精准)</option>
                <option value="gpt-4-academic">GPT-4 学术专业版</option>
                <option value="claude-3-opus">Claude 3 Opus (深度内容分析)</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center bg-surface-container py-3 px-4 rounded-md border border-outline-variant">
             <span className="text-sm font-medium text-on-surface-variant">
               {testResult === 'success' && <span className="text-green-600 flex items-center gap-1"><Check size={16}/> 连接成功，延迟 142ms</span>}
             </span>
            <button 
              onClick={handleTestConnection}
              disabled={isTesting}
              className="bg-white border border-primary text-primary px-4 py-2 rounded text-[13px] font-bold hover:bg-primary/5 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw size={14} className={isTesting ? "animate-spin" : ""} />
              {isTesting ? "正在测试..." : "测试连接连通性"}
            </button>
          </div>
        </section>

        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4 border-b border-surface-container-low pb-4">
            <Monitor className="text-primary" size={24} />
            <h2 className="text-[20px] font-semibold text-on-background m-0">核心系统依赖环境</h2>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5 p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <label className="text-[13px] font-semibold text-on-surface uppercase tracking-wider" htmlFor="pandoc-path">Pandoc 执行核心二进制路径</label>
              <div className="flex gap-2 relative">
                <input 
                  id="pandoc-path" 
                  type="text" 
                  defaultValue="/usr/local/bin/pandoc"
                  className="flex-1 bg-white border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1" 
                />
                <button className="absolute right-2 top-1.5 text-xs bg-surface-container-highest px-2 py-1 rounded text-on-surface-variant hover:text-primary font-medium">重置默认</button>
              </div>
              <p className="text-[12px] text-on-surface-variant mt-1 leading-snug">文档转换流的根节点依赖。如果不填写，系统将尝试从环境变量中推断路径。</p>
            </div>
            
            <div className="flex flex-col gap-1.5 p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <label className="text-[13px] font-semibold text-on-surface uppercase tracking-wider" htmlFor="save-path">编排产物默认导出归档目录</label>
              <input 
                id="save-path" 
                type="text" 
                defaultValue="~/Documents/Academic_Exports/Processed"
                className="w-full bg-white border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1" 
              />
            </div>

            <div className="flex flex-col gap-1.5 p-4 bg-[#F8FAFC] rounded border border-[#E2E8F0]">
              <label className="text-[13px] font-semibold text-on-surface uppercase tracking-wider" htmlFor="lang-select">界面主语言环境设置</label>
              <select 
                id="lang-select" 
                className="w-full bg-white border border-outline-variant rounded px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1"
                defaultValue="zh-CN"
              >
                <option value="zh-CN">中文 (简体)</option>
                <option value="en">English (US)</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 border-t border-outline-variant pt-6 flex justify-end gap-3 pb-8">
        <button className="bg-transparent border border-outline-variant text-on-surface px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors disabled:opacity-50" disabled={isSaving}>
          放弃当前更改
        </button>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm flex items-center gap-2 ${saveSuccess ? 'bg-green-600 text-white' : 'bg-primary text-on-primary hover:bg-primary/90'} disabled:opacity-80`}
        >
          {isSaving ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              正在保存...
            </>
          ) : saveSuccess ? (
            <>
              <Check size={18} />
              保存成功
            </>
          ) : (
            <>
              <Save size={18} />
              保存全局配置
            </>
          )}
        </button>
      </div>
    </div>
  );
}
