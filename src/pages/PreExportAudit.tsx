import React, { useState } from 'react';
import { Radar, AlertTriangle, ShieldCheck, Wrench, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';

export function PreExportAudit() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [issuesFixed, setIssuesFixed] = useState({ bib: false, margin: false });

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setIssuesFixed({ bib: false, margin: false });
    
    let current = 0;
    const interval = setInterval(() => {
      current += 10;
      setScanProgress(current);
      if(current >= 100) {
        clearInterval(interval);
        setIsScanning(false);
      }
    }, 200);
  };

  const fixBib = () => {
    setIssuesFixed(prev => ({ ...prev, bib: true }));
  };

  const fixMargin = () => {
    setIssuesFixed(prev => ({ ...prev, margin: true }));
  };

  const hasIssues = !issuesFixed.bib || !issuesFixed.margin;

  return (
    <div className="max-w-6xl mx-auto flex gap-gutter pb-8 h-[calc(100vh-100px)]">
      {/* Left Column: Audit Details */}
      <div className="flex-1 flex flex-col gap-stack-md overflow-y-auto pr-2 mt-4">
        
        {/* Real-time Scanner Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radar className={`text-primary ${isScanning ? 'animate-spin' : ''}`} size={24} />
              <h3 className="font-h1-title text-[18px] text-on-surface font-semibold">预导出自动扫描</h3>
            </div>
            {!isScanning && (
              <button 
                onClick={startScan}
                className="bg-primary-container text-on-primary font-medium text-sm px-4 py-1.5 rounded-md hover:bg-surface-tint transition-colors"
              >
                重新扫描文档
              </button>
            )}
          </div>
          
          {isScanning && (
            <div className="w-full">
              <div className="flex justify-between text-xs font-code-sm mb-1 text-on-surface-variant">
                <span>正在检查各项规范...</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-1.5 rounded-full transition-all duration-200" style={{ width: scanProgress + '%' }}></div>
              </div>
            </div>
          )}
        </div>

        {!isScanning && (
          <>
            {/* Audit Category: Data Integrity */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={!issuesFixed.bib ? "text-error" : "text-green-600"} size={20} />
                  <h4 className="font-body-main font-semibold text-on-surface">数据完整性检查</h4>
                </div>
                {!issuesFixed.bib ? (
                  <span className="bg-error-container text-on-error-container font-label-caps text-label-caps px-2 py-1 rounded">发现 1 个错误</span>
                ) : (
                  <span className="bg-[#E8F5E9] text-[#2E7D32] font-label-caps text-label-caps px-2 py-1 rounded">检查通过</span>
                )}
              </div>
              
              {!issuesFixed.bib && (
                <div className="p-0">
                  <div className="flex items-start justify-between p-4 border-b border-outline-variant hover:bg-surface-bright transition-colors">
                    <div className="flex-1 pr-4">
                      <p className="font-body-main text-on-surface font-semibold mb-1">缺失引用文献 (Missing BibTeX Key)</p>
                      <p className="text-on-surface-variant text-sm mb-2 leading-relaxed">正文第二段引用的 <code className="bg-surface-container px-1 py-0.5 rounded font-mono">[@smith2023]</code> 在您上传的 references.bib 文件中未找到对应条目定义。</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button 
                        onClick={fixBib}
                        className="px-4 py-2 bg-error text-white text-sm font-medium rounded-md flex items-center gap-1.5 hover:bg-error/90 transition-colors shadow-sm"
                      >
                        <Wrench size={16} />
                        AI 智能修复
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Audit Category: Formatting Standards */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden">
              <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={!issuesFixed.margin ? "text-secondary" : "text-green-600"} size={20} />
                  <h4 className="font-body-main font-semibold text-on-surface">排版与格式冲突</h4>
                </div>
                {!issuesFixed.margin ? (
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed font-label-caps text-label-caps px-2 py-1 rounded">1 个警告</span>
                ) : (
                  <span className="bg-[#E8F5E9] text-[#2E7D32] font-label-caps text-label-caps px-2 py-1 rounded">检查通过</span>
                )}
              </div>
              
              {!issuesFixed.margin && (
                <div className="p-0">
                  <div className="flex items-start justify-between p-4 hover:bg-surface-bright transition-colors">
                    <div className="flex-1 pr-4">
                      <p className="font-body-main text-on-surface font-semibold mb-1">页边距规范冲突</p>
                      <p className="text-on-surface-variant text-sm leading-relaxed">文档左侧边距计算为 2.5cm，但您选择的排版配置 JSON （目标期刊要求）统一要求左边距为 3.0cm。</p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button 
                        onClick={fixMargin}
                        className="px-4 py-2 border border-secondary text-secondary font-medium text-sm rounded-md flex items-center gap-1.5 hover:bg-secondary/10 transition-colors"
                      >
                        自动修复为目标规范
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Always passing: Table Logic */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden opacity-90">
              <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="text-[#2E7D32]" size={20} />
                  <h4 className="font-body-main font-semibold text-on-surface">LaTeX 表格溢出检查</h4>
                </div>
                <span className="text-[#2E7D32] font-label-caps text-label-caps px-2 py-1 rounded bg-[#E8F5E9]">全部通过</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right Column: Summary Sidebar */}
      <div className="w-80 shrink-0 mt-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 flex flex-col h-full sticky top-0 shadow-sm">
          <h3 className="font-body-main font-semibold text-on-surface mb-6 border-b border-outline-variant pb-3">全局导出就绪状态</h3>
          
          {/* Health Score */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="46" fill="none" 
                  stroke={hasIssues ? "#F59E0B" : "#10B981"} 
                  strokeWidth="8" 
                  strokeDasharray="289" 
                  strokeDashoffset={hasIssues ? 60 : 0} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-display-lg text-[42px] font-bold text-on-surface leading-none">{hasIssues ? 79 : 100}</span>
                <span className="font-label-caps text-xs text-on-surface-variant font-medium mt-1">健康度评估</span>
              </div>
            </div>
            {hasIssues ? (
              <span className="bg-[#FFF8E1] text-[#F57F17] font-medium text-xs px-3 py-1.5 rounded-full border border-[#FFECB3]">建议修复后再导出</span>
            ) : (
              <span className="bg-[#E8F5E9] text-[#2E7D32] font-medium text-xs px-3 py-1.5 rounded-full border border-[#C8E6C9]">准许导出，完美符合规范</span>
            )}
          </div>

          {/* Metric Summary */}
          <div className="space-y-4 flex-1">
            <div className="flex justify-between items-center text-sm border-b border-surface-variant pb-2">
              <span className="text-on-surface-variant font-medium">已扫描内容体量</span>
              <span className="font-code-sm text-on-surface font-semibold">14,208 字 / 3 图表</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-surface-variant pb-2">
              <span className="text-on-surface-variant font-medium">致命转换错误</span>
              <span className={`font-code-sm font-bold ${!issuesFixed.bib ? 'text-error' : 'text-on-surface'}`}>
                {!issuesFixed.bib ? 1 : 0}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm pb-2">
              <span className="text-on-surface-variant font-medium">排版规范警告</span>
              <span className={`font-code-sm font-bold ${!issuesFixed.margin ? 'text-secondary' : 'text-on-surface'}`}>
                {!issuesFixed.margin ? 1 : 0}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 pt-6 border-t border-outline-variant flex flex-col gap-3">
            <button 
              disabled={hasIssues || isScanning} 
              className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              onClick={() => alert("正开始生成最终文献...")}
            >
              继续导出 Word 文档
              <ArrowRight size={18} />
            </button>
            {hasIssues && !isScanning && (
               <p className="text-[11px] text-center text-outline leading-tight mt-1">您还有未处理的致命错误或警告。<br/>建议点击面板中的 "自动修复" 解决后导出。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
