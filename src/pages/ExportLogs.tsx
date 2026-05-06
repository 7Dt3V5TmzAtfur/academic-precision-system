import React, { useState } from 'react';
import { TerminalSquare, AlertCircle, AlertTriangle, CheckCircle2, Search, Download } from 'lucide-react';

export function ExportLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  const fullLogs = [
    { time: '[2023-10-27 14:32:01]', level: 'INFO', text: 'Initializing Pandoc conversion environment...' },
    { time: '[2023-10-27 14:32:01]', level: 'INFO', text: 'Source: /workspace/docs/thesis_chapter3.tex' },
    { time: '[2023-10-27 14:32:02]', level: 'INFO', text: 'Target format: DOCX (via pandoc)' },
    { time: '[2023-10-27 14:32:02]', level: 'WARNING', text: 'Missing citation key: [@smith2023] in line 142. Proceeding with dummy output.' },
    { time: '[2023-10-27 14:32:03]', level: 'INFO', text: 'Parsing figures...' },
    { time: '[2023-10-27 14:32:04]', level: 'WARNING', text: 'Overfull \\hbox (15.22pt too wide) detected in paragraph at lines 210--215.' },
    { time: '[2023-10-27 14:32:05]', level: 'INFO', text: 'Generating bibliography...' },
    { time: '[2023-10-27 14:32:06]', level: 'ERROR', text: 'Package babel Error: Unknown option `frenchb\'. Either you misspelled it or the language definition file frenchb.ldf was not found.' },
    { time: '[2023-10-27 14:32:06]', level: 'INFO', text: 'Attempting fallback recovery...' },
    { time: '[2023-10-27 14:32:08]', level: 'INFO', text: 'Output generated with warnings. Location: /workspace/out/thesis_chapter3.docx' },
  ];

  const filteredLogs = fullLogs.filter(log => 
    log.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'INFO': return 'text-[#569CD6]';
      case 'WARNING': return 'text-[#CE9178]';
      case 'ERROR': return 'text-[#F44747]';
      default: return 'text-[#D4D4D4]';
    }
  };

  const downloadLogs = () => {
    const text = fullLogs.map(l => `${l.time} [${l.level}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'conversion_logs.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-background pb-8 pt-4">
      <header className="mb-stack-lg flex justify-between items-end border-b border-surface-variant pb-stack-sm">
        <div>
          <h1 className="font-h1-title text-[24px] font-bold text-primary-container">导出流审计与系统日志</h1>
          <p className="font-body-main text-body-main text-on-surface-variant mt-1">详细记录 Pandoc 转换过程中的技术细节与链路分析。</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input 
              type="text" 
              placeholder="过滤终端日志..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-60 bg-surface-container-lowest border border-outline-variant rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1"
            />
          </div>
          <button onClick={downloadLogs} className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
            <Download size={16}/>
            导出 TXT
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 h-[calc(100vh-180px)]">
        <section className="lg:col-span-8 flex flex-col bg-[#1E1E1E] rounded-lg border border-surface-variant shadow-sm overflow-hidden">
          <div className="bg-surface-container-highest border-b border-surface-variant px-4 py-2 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <TerminalSquare className="text-on-surface-variant" size={18} />
              <span className="font-label-caps text-label-caps text-on-surface font-semibold tracking-wider">PANDOC EXPORT TERMINAL</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
            </div>
          </div>
          <div className="flex-1 p-5 font-code-sm text-[13px] overflow-y-auto whitespace-pre-wrap leading-relaxed custom-scrollbar bg-[#1E1E1E]">
            {filteredLogs.length > 0 ? filteredLogs.map((log, idx) => (
              <div key={idx} className="mb-0.5 font-[Consolas,monospace]">
                <span className="text-[#858585]">{log.time}</span>{' '}
                <span className={getLevelColor(log.level)}>[{log.level}]</span>{' '}
                <span className={log.text.includes('/workspace/') ? 'text-[#4EC9B0]' : 'text-[#D4D4D4]'}>
                  {log.text}
                </span>
              </div>
            )) : (
              <div className="text-[#858585] italic mt-4 text-center">No logs match your filter.</div>
            )}
          </div>
        </section>

        <aside className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm relative overflow-hidden">
            <h3 className="font-h1-title text-[20px] font-semibold text-on-surface">转换执行状态记录</h3>
            <div className="mt-4 flex items-end gap-6">
              <div>
                <p className="font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-semibold mb-1">通过率</p>
                <p className="font-display-lg text-[34px] font-bold text-on-surface leading-none">98.5<span className="text-xl">%</span></p>
              </div>
              <div className="border-l border-surface-variant pl-6">
                <p className="font-label-caps text-on-surface-variant uppercase tracking-wider text-xs font-semibold mb-1">执行耗时</p>
                <p className="font-display-lg text-[34px] font-bold text-on-surface leading-none">7.2<span className="text-xl">s</span></p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex flex-col overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-variant flex items-center bg-surface-bright">
              <span className="font-label-caps text-[13px] font-bold text-primary tracking-wide">AI 诊断报告与修复建议</span>
            </div>
            <div className="p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
              <div className="bg-surface border border-surface-variant p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-[#F59E0B] shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">缺失引用键: <code className="bg-surface-container-high px-1 py-0.5 rounded text-xs font-mono border border-outline-variant">[@smith2023]</code></h4>
                    <p className="text-[13px] text-on-surface-variant mt-1.5 leading-relaxed">参考文献数据库中不包含 <span className="font-mono text-xs">smith2023</span> 条目。</p>
                    <div className="mt-3 bg-[#EEF2FF] border border-[#C7D2FE] p-2.5 rounded text-xs text-[#4338CA] font-medium leading-relaxed">
                      💡 操作建议：请核对您的 .bib 文件，确保引文键值正确无误。
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-surface border border-surface-variant p-4 rounded-lg shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-error shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-semibold text-on-surface">Babel 宏包选项错误: <code className="bg-surface-container-high px-1 py-0.5 rounded text-xs font-mono border border-outline-variant">frenchb</code></h4>
                    <p className="text-[13px] text-on-surface-variant mt-1.5 leading-relaxed"><span className="font-mono text-xs">frenchb</span> 选项在较新版本的 babel 宏包中已被弃用或不兼容该编译链。</p>
                    <div className="mt-3 bg-[#EEF2FF] border border-[#C7D2FE] p-2.5 rounded text-xs text-[#4338CA] font-medium leading-relaxed">
                      💡 修复方案：您可以要求 AI 分析器在导言区自动替换为新版格式，然后再重试编译。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
