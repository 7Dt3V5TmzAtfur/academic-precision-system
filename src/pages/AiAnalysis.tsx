import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, CheckCircle2, FileJson, Settings2, Edit3, Copy, Loader2, AlertCircle } from 'lucide-react';

export function AiAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [resultsReady, setResultsReady] = useState(false);
  const [jsonOutput, setJsonOutput] = useState('{\n  // 等待样本上传以生成配置...\n}');
  
  const [configParams, setConfigParams] = useState({
    baseUrl: 'https://api.longcat.chat/openai',
    apiKey: 'xxxx',
    model: 'LongCat-Flash-Chat'
  });

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  const simulateAnalysis = () => {
    setIsAnalyzing(true);
    setResultsReady(false);
    setProgress(0);
    setProgressText('正在解析 Word 文档结构...');

    timeoutsRef.current.push(setTimeout(() => { setProgress(25); setProgressText('正在提取层级标题序号规律...'); }, 1000));
    timeoutsRef.current.push(setTimeout(() => { setProgress(60); setProgressText('正在分析中西文字体映射机制...'); }, 2000));
    timeoutsRef.current.push(setTimeout(() => { setProgress(85); setProgressText('正在生成 JSON 样式规则...'); }, 3500));

    timeoutsRef.current.push(setTimeout(() => {
      setIsAnalyzing(false);
      setProgress(100);
      setResultsReady(true);
      setJsonOutput(`{
  "document_rules": {
    "headings": {
      "level_1": {
        "pattern": "一、",
        "alignment": "center",
        "font_family_cn": "黑体",
        "font_family_en": "Times New Roman",
        "size": "三号",
        "weight": "normal"
      },
      "level_2": {
        "pattern": "（一）",
        "font_family_cn": "楷体_GB2312",
        "font_family_en": "Times New Roman",
        "size": "三号"
      }
    },
    "body": {
      "font_family_cn": "仿宋_GB2312",
      "font_family_en": "Times New Roman",
      "size": "三号",
      "line_spacing": "28pt_fixed"
    },
    "page_setup": {
      "size": "A4",
      "margins": { "top": "3.4cm", "bottom": "3.5cm", "left": "2.6cm", "right": "2.5cm" }
    },
    "auto_symbols": {
      "convert_quotes": true
    }
  }
}`);
    }, 5000));
  };

  const handleApply = () => {
    alert("排版配置已成功保存并应用至当前项目！");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-stack-md h-full pb-8">
      {/* Page Title */}
      <div className="mb-stack-lg border-b border-outline-variant pb-6 mt-4">
        <h2 className="font-h1-title text-[28px] font-bold text-on-surface">AI 期刊模板分析器</h2>
        <p className="text-on-surface-variant mt-2 font-body-main max-w-3xl">上传样例 Word 文档，借助 LLM 自动提取排版规范并生成结构化配置。不同的中文期刊要求不同，只需一段分析即可完成自动配置。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter items-start h-[calc(100vh-220px)]">
        {/* Left Column: Input & Process */}
        <div className="space-y-stack-md flex flex-col h-full">
          {/* Configuration Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
            <h3 className="font-h1-title text-[18px] font-semibold text-on-surface mb-stack-sm flex items-center border-b border-surface-container-low pb-3">
              <Settings2 className="mr-2 text-primary-container" size={20} />
              OpenAI 接口环境配置
            </h3>
            <form className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">Base URL</label>
                <input 
                  type="text" 
                  value={configParams.baseUrl}
                  onChange={e => setConfigParams({...configParams, baseUrl: e.target.value})}
                  className="w-full bg-white border border-outline-variant text-on-surface text-sm rounded px-3 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">API Key</label>
                  <input 
                    type="password" 
                    value={configParams.apiKey}
                    onChange={e => setConfigParams({...configParams, apiKey: e.target.value})}
                    className="w-full bg-white border border-outline-variant text-on-surface text-sm rounded px-3 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">分析模型</label>
                  <select 
                    value={configParams.model}
                    onChange={e => setConfigParams({...configParams, model: e.target.value})}
                    className="w-full bg-white border border-outline-variant text-on-surface text-sm rounded px-3 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  >
                    <option value="LongCat-Flash-Chat">LongCat-Flash-Chat (默认)</option>
                    <option value="GPT-4o">GPT-4o (精细)</option>
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Upload Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm flex-1 flex flex-col">
            <h3 className="font-h1-title text-[18px] font-semibold text-on-surface mb-stack-sm flex items-center border-b border-surface-container-low pb-3">
              <UploadCloud className="mr-2 text-primary-container" size={20} />
              样本上传与智能提取
            </h3>
            
            <div 
              onClick={() => !isAnalyzing && simulateAnalysis()}
              className={`mt-4 border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors flex-1 min-h-[200px] ${isAnalyzing ? 'border-primary/50 bg-primary/5 cursor-not-allowed' : 'border-outline-variant bg-surface-bright hover:bg-surface-container-low cursor-pointer hover:border-primary/60'}`}
            >
              {isAnalyzing ? (
                <Loader2 size={48} className="text-primary animate-spin mb-4" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-4 transition-transform hover:scale-105">
                  <FileJson size={32} />
                </div>
              )}
              <p className="font-body-main text-on-surface font-medium mb-1">
                {isAnalyzing ? 'AI 分析中，请稍候...' : '点击或拖拽期刊样板 Word 文件 (.docx)'}
              </p>
              {!isAnalyzing && <p className="text-xs text-on-surface-variant mt-2">支持系统自带 AI 模型快速逆向解析排版公式</p>}
            </div>

            {/* Process Indicator */}
            {isAnalyzing && (
              <div className="mt-4 bg-white border border-outline-variant rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-primary flex items-center">
                    <span className="animate-pulse mr-2 w-2 h-2 rounded-full bg-primary"></span>
                    {progressText}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant font-code-sm">{progress}%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: progress + '%' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results & Editor */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg h-full flex flex-col shadow-sm">
          <div className="p-4 border-b border-surface-container-low bg-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="font-h1-title text-[18px] font-semibold text-on-surface flex items-center">
                <FileJson className="mr-2 text-primary" size={20} />
                规则提取结果与校验
              </h3>
              <button 
                onClick={handleApply}
                disabled={!resultsReady}
                className="bg-primary text-on-primary font-medium text-sm px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={16} className="mr-1.5" />
                保存并应用到项目
              </button>
            </div>
            
            {resultsReady && (
              <div className="mt-4 bg-green-50 border border-green-200 text-green-800 p-3 rounded flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">分析成功完成</p>
                  <p>AI 已成功提取各级标题序号（如一、1.）、中英文字体（如仿宋、Times New Roman）以及页面边距规范。您可在下方直接编辑 JSON 源码或在【排版设置】面板进行可视化调优。</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 bg-[#1E1E1E] flex flex-col relative rounded-b-lg overflow-hidden group">
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button className="h-7 px-3 bg-surface-variant text-on-surface rounded text-xs font-medium hover:bg-surface-dim flex items-center gap-1" onClick={() => navigator.clipboard.writeText(jsonOutput)}>
                <Copy size={12} /> 复制
              </button>
            </div>
            <textarea 
              value={jsonOutput}
              onChange={(e) => setJsonOutput(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full bg-transparent text-[#D4D4D4] font-code-sm text-[13px] p-4 resize-none focus:outline-none leading-relaxed" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
