import React, { useState } from 'react';
import { GitBranch, History, ChevronRight, FileText, Download, RotateCcw, LayoutTemplate } from 'lucide-react';

export function VersionControl() {
  const [versions, setVersions] = useState([
    { id: 'v2.0', date: '2023-11-04 15:30', desc: '更新图表交叉引用及中文宋体排版', current: true },
    { id: 'v1.9', date: '2023-11-03 09:15', desc: '修复标题层级，启用AI参数分析', current: false },
    { id: 'v1.8', date: '2023-11-01 19:40', desc: '初始 Pandoc 基础转换配置', current: false },
  ]);

  const [selectedVersion, setSelectedVersion] = useState(versions[1]);

  const handleRestore = () => {
    alert(`系统已成功恢复至 ${selectedVersion.id} 版本配置！`);
  };

  const handleExportDiff = () => {
    alert('正在为您生成 v2.0 与 v1.9 的版本差异报告 (Diff Report)...');
  };

  return (
    <div className="flex flex-col h-full bg-background pb-8 pt-4">
      <header className="mb-stack-lg border-b border-surface-variant pb-stack-sm">
        <h1 className="font-h1-title text-[28px] font-bold text-on-surface">版本管理与排版对比</h1>
        <p className="font-body-main text-on-surface-variant mt-2">追踪每一次转换记录，可视化对比排版参数的变化，并支持一键恢复历史稳定版本。</p>
      </header>

      <div className="flex flex-1 gap-6 h-[calc(100vh-170px)]">
        {/* Left Column: Version History */}
        <div className="w-1/3 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-surface-variant bg-surface-container flex items-center gap-2">
            <History size={18} className="text-primary" />
            <h2 className="font-semibold text-on-surface">版本历史追踪</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
            {versions.map(v => (
              <div 
                key={v.id} 
                onClick={() => setSelectedVersion(v)}
                className={`p-3 rounded-md cursor-pointer border transition-colors ${selectedVersion.id === v.id ? 'bg-primary/10 border-primary shadow-sm' : 'bg-surface border-outline-variant hover:bg-surface-container'}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-code-sm font-bold text-[14px] text-on-surface">{v.id}</span>
                    {v.current && <span className="bg-[#E8F5E9] text-[#2E7D32] text-[10px] px-2 py-0.5 rounded-full border border-[#C8E6C9]">当前生效</span>}
                  </div>
                  <span className="text-[12px] text-on-surface-variant">{v.date}</span>
                </div>
                <p className="text-[13px] text-on-surface-variant line-clamp-1">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Diff Visualizer */}
        <div className="w-2/3 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm overflow-hidden relative">
          <div className="p-4 border-b border-surface-variant flex justify-between items-center bg-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-code-sm text-on-surface-variant">{selectedVersion.id}</span>
                <ChevronRight size={14} className="text-outline" />
                <span className="font-code-sm font-semibold text-primary">v2.0 (当前)</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExportDiff} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border border-outline-variant hover:bg-surface-container transition-colors">
                <Download size={14} /> 导出差异报告
              </button>
              <button onClick={handleRestore} className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-warning text-on-primary-container border border-warning/20 hover:opacity-90 transition-opacity font-medium bg-[#FFF3E0] text-[#E65100]">
                <RotateCcw size={14} /> 恢复至此版本
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-[#F8FAFC] p-6 relative">
            <h3 className="text-sm font-semibold text-on-surface mb-3 flex items-center gap-2">
              <LayoutTemplate size={16} className="text-primary"/> 
              排版参数差异 (JSON Diff)
            </h3>
            
            {/* Simulated Diff Code Block */}
            <div className="bg-[#1E1E1E] rounded-md font-code-sm text-[13px] leading-relaxed p-4 border border-[#333] shadow-inner overflow-x-auto">
              <pre className="text-[#D4D4D4]">
<span className="text-[#858585]">  "headings": {'{'}</span><br/>
<span className="text-[#858585]">    "level_1": {'{'}</span><br/>
<span className="w-full inline-block bg-[#F44747]/20 text-[#F44747] border-l-2 border-[#F44747] px-2">-     "font_family_cn": "宋体",</span><br/>
<span className="w-full inline-block bg-[#27C93F]/20 text-[#4EC9B0] border-l-2 border-[#27C93F] px-2">+     "font_family_cn": "黑体",</span><br/>
<span className="text-[#858585]">      "size": "三号"</span><br/>
<span className="text-[#858585]">    {'}'}</span><br/>
<span className="text-[#858585]">  {'}'},</span><br/>
<span className="text-[#858585]">  "body": {'{'}</span><br/>
<span className="w-full inline-block bg-[#F44747]/20 text-[#F44747] border-l-2 border-[#F44747] px-2">-   "line_spacing": "1.5",</span><br/>
<span className="w-full inline-block bg-[#27C93F]/20 text-[#4EC9B0] border-l-2 border-[#27C93F] px-2">+   "line_spacing": "28pt_fixed",</span><br/>
<span className="text-[#858585]">    "font_family_cn": "仿宋_GB2312"</span><br/>
<span className="text-[#858585]">  {'}'}</span><br/>
<span className="w-full inline-block bg-[#27C93F]/20 text-[#4EC9B0] border-l-2 border-[#27C93F] px-2">+ "auto_symbols": {'{'}</span><br/>
<span className="w-full inline-block bg-[#27C93F]/20 text-[#4EC9B0] border-l-2 border-[#27C93F] px-2">+   "convert_quotes": true</span><br/>
<span className="w-full inline-block bg-[#27C93F]/20 text-[#4EC9B0] border-l-2 border-[#27C93F] px-2">+ {'}'}</span>
              </pre>
            </div>
            
            <div className="mt-6 flex flex-col gap-2">
              <div className="bg-[#E8F5E9] border border-[#C8E6C9] p-3 rounded-md flex items-start gap-3">
                <GitBranch size={18} className="text-[#2E7D32] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#2E7D32]">版本进化摘要</h4>
                  <p className="text-xs text-[#2E7D32]/80 mt-1">发现您在 v2.0 中调整了黑体标题并修正了行距固定值，同时启用了智能符号转换。这符合常规的专业期刊要求。</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
