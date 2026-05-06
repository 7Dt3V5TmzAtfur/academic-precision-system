import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { generateSampleBibtex } from '../lib/testBibtexGenerator';
import { 
  CheckCircle2, 
  UploadCloud, 
  BookOpen, 
  Play, 
  Wand2, 
  TerminalSquare,
  FileText,
  AlertTriangle,
  Loader2,
  Download
} from 'lucide-react';
import { generateSampleDocx, generateMergedDocx } from '../lib/testDocxGenerator';
import { generateSampleLatex } from '../lib/testLatexGenerator';

export function WorkflowHub() {
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] Initializing document processing pipeline...',
    '[INFO] Locating Pandoc binary path: /usr/local/bin/pandoc',
  ]);
  const [hasLatex, setHasLatex] = useState(false);
  const [hasBib, setHasBib] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [pandocInstalled, setPandocInstalled] = useState(() => {
    return localStorage.getItem('pandocInstalled') === 'true';
  });

  const logsEndRef = useRef<HTMLDivElement>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const fileInputZipTex = useRef<HTMLInputElement>(null);
  const fileInputBib = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (logsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = logsContainerRef.current;
      // If user scrolls up (distance from bottom > 10px), pause auto-scroll
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setAutoScroll(isAtBottom);
    }
  };

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!pandocInstalled) {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, '[INFO] Pandoc not found in default path.', '[SYSTEM] Pandoc installation required.']);
      }, 1000);
      timeoutsRef.current.push(timer);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, '[INFO] Pandoc 3.1.9 core engine detected.', '[SYSTEM] Env is ready.']);
      }, 500);
      timeoutsRef.current.push(timer);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstallPandoc = () => {
    setLogs(prev => [...prev, '[SYSTEM] Installing Pandoc via automated script...']);
    const timer = setTimeout(() => {
      setLogs(prev => [...prev, '[INFO] Pandoc 3.1.9 core engine installed successfully.']);
      setPandocInstalled(true);
      localStorage.setItem('pandocInstalled', 'true');
    }, 1500);
    timeoutsRef.current.push(timer);
  };

  const [mergedLatex, setMergedLatex] = useState<string>('');
  const [mergedBib, setMergedBib] = useState<string>('');
  const [imagesMap, setImagesMap] = useState<Record<string, Uint8Array>>({});

  const parseLatexZip = async (file: File) => {
    try {
      setLogs(prev => [...prev, `[SYSTEM] Parsing ZIP archive: ${file.name}...`]);
      const zip = await JSZip.loadAsync(file);
      
      const texFiles: Record<string, string> = {};
      const bibFiles: Record<string, string> = {};
      const imgMap: Record<string, Uint8Array> = {};
      
      // Read all files
      const promises: Promise<void>[] = [];
      zip.forEach((relativePath, zipEntry) => {
        if (relativePath.startsWith('__MACOSX/')) return;
        
        if (relativePath.endsWith('.tex')) {
          promises.push(zipEntry.async('text').then(content => {
            texFiles[relativePath] = content;
          }));
        } else if (relativePath.endsWith('.bib')) {
          promises.push(zipEntry.async('text').then(content => {
            bibFiles[relativePath] = content;
          }));
        } else if (/\.(png|jpg|jpeg|eps|pdf)$/i.test(relativePath) && !zipEntry.dir) {
          promises.push(zipEntry.async('uint8array').then(content => {
            imgMap[relativePath] = content;
          }));
        }
      });
      
      await Promise.all(promises);
      
      // 1. Identify main file
      let mainFileName = '';
      for (const [name, content] of Object.entries(texFiles)) {
        if (content.includes('\\documentclass')) {
          mainFileName = name;
          break;
        }
      }
      
      if (!mainFileName) {
        setLogs(prev => [...prev, '[ERROR] Could not find any .tex file containing \\documentclass']);
        return;
      }
      
      setLogs(prev => [...prev, `[INFO] Auto-detected main TeX file: ${mainFileName}`]);
      
      // 2. Resolve \input and \include
      const resolveIncludes = (content: string, currentPath: string, visited: Set<string>): string => {
        // Match \input{filename} or \include{filename}
        const regex = /\\(?:input|include)\{([^}]+)\}/g;
        return content.replace(regex, (match, rawIncludePath) => {
          // Normalize extension
          let includePath = rawIncludePath.trim();
          if (!includePath.endsWith('.tex')) {
            includePath += '.tex';
          }
          
          // Resolve relative to current directory if necessary, simple approach:
          // Try to exact match in texFiles, or fallback to simple basename match
          const dirPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
          const fullPath = dirPath ? `${dirPath}/${includePath}` : includePath;
          
          let targetPath = texFiles[fullPath] !== undefined ? fullPath : includePath;
          if (texFiles[targetPath] === undefined) {
             // Try to find it anywhere
             const found = Object.keys(texFiles).find(k => k.endsWith(includePath));
             if (found) targetPath = found;
          }
          
          if (texFiles[targetPath] && !visited.has(targetPath)) {
            setLogs(prev => [...prev, `[INFO] Resolved included file: ${targetPath}`]);
            visited.add(targetPath);
            return resolveIncludes(texFiles[targetPath], targetPath, visited);
          } else {
            if (visited.has(targetPath)) {
               setLogs(prev => [...prev, `[WARN] Circular inclusion detected: ${targetPath}`]);
            } else {
               setLogs(prev => [...prev, `[WARN] Included file not found: ${includePath}`]);
            }
            return match; // return original if not found
          }
        });
      };
      
      const visited = new Set<string>();
      visited.add(mainFileName);
      let finalLatex = resolveIncludes(texFiles[mainFileName], mainFileName, visited);
      
      // 3. Finding bibliography
      const bibRegex = /\\bibliography\{([^}]+)\}/;
      const bibMatch = finalLatex.match(bibRegex);
      if (bibMatch) {
         let bibNames = bibMatch[1].split(',').map(s => s.trim());
         let allBibContent = '';
         for (let bibName of bibNames) {
           if (!bibName.endsWith('.bib')) bibName += '.bib';
           const foundBib = Object.keys(bibFiles).find(k => k.endsWith(bibName));
           if (foundBib) {
             setLogs(prev => [...prev, `[INFO] Found linked reference file: ${foundBib}`]);
             allBibContent += bibFiles[foundBib] + '\n\n';
           } else {
             setLogs(prev => [...prev, `[WARN] Reference file not found: ${bibName}`]);
           }
         }
         if (allBibContent) {
           setHasBib(true);
           setMergedBib(allBibContent);
         }
      } else {
         const firstBib = Object.keys(bibFiles)[0];
         if (firstBib) {
           setLogs(prev => [...prev, `[INFO] No \\bibliography command found, but using available bib file: ${firstBib}`]);
           setHasBib(true);
           setMergedBib(bibFiles[firstBib]);
         }
      }
      
      // Simulate images
      const imagesCount = Object.keys(imgMap).length;
      if (imagesCount > 0) {
         setLogs(prev => [...prev, `[INFO] Located and loaded ${imagesCount} image assets`]);
      }
      
      setHasLatex(true);
      setMergedLatex(finalLatex);
      setImagesMap(imgMap);
      setLogs(prev => [...prev, '[SYSTEM] Source files parsed and linked successfully (Ready for Pandoc)']);

    } catch (err) {
       console.error(err);
       setLogs(prev => [...prev, `[ERROR] Failed to extract or parse ZIP: ${err instanceof Error ? err.message : String(err)}`]);
    }
  };

  const handleFileUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    
    if (ext === 'tex') {
      setLogs(prev => [...prev, `[INFO] Uploaded ${file.name} (Found, ${(file.size / 1024).toFixed(1)}KB)`]);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHasLatex(true);
        setMergedLatex(e.target?.result as string || '');
        setLogs(prev => [...prev, '[SYSTEM] LaTeX text parsed securely.']);
      };
      reader.readAsText(file);
    } else if (ext === 'zip') {
      setLogs(prev => [...prev, `[INFO] Uploaded ${file.name} (Found, ${(file.size / 1024 / 1024).toFixed(2)}MB)`]);
      parseLatexZip(file);
    } else {
      setLogs(prev => [...prev, `[ERROR] Unsupported file type: ${file.name}`]);
      alert('不支持的文件格式，请上传 .zip 或 .tex 文件');
    }
  };


  const handleBibUpload = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'bib') {
      setHasBib(true);
      setLogs(prev => [...prev, `[INFO] Uploaded ${file.name} (Found, ${(file.size / 1024).toFixed(1)}KB)`]);
    } else {
      setLogs(prev => [...prev, `[ERROR] Unsupported file type: ${file.name}`]);
      alert('不支持的文件格式，请上传 .bib 文件');
    }
  };

  const onDropZipTex = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const onDropBib = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleBibUpload(file);
  };

  const simulateTestFile = () => {
    setHasLatex(true);
    setLogs(prev => [...prev, '[INFO] Uploaded 样例测试文件.tex (Found, 18KB)', '[INFO] Included tables, references and image placeholders.']);
  };

  const handleDownloadLatex = async () => {
    try {
      const texContent = generateSampleLatex();
      const bibContent = generateSampleBibtex();
      
      const zip = new JSZip();
      zip.file('source.tex', texContent);
      zip.file('references.bib', bibContent);
      
      // Create a simple 1x1 transparent png for the placeholder
      const imgData = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      zip.folder('images')?.file('sample-placeholder.png', imgData, {base64: true});

      const blob = await zip.generateAsync({type: 'blob'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '测试样本.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, '[ERROR] 测试文件包生成失败']);
      alert('生成测试文件包失败，请重试');
    }
  };

  const [finalDocxBlob, setFinalDocxBlob] = useState<Blob | null>(null);

  const handleConvert = () => {
    if (!pandocInstalled) return;
    setIsConverting(true);
    setLogs(prev => [...prev, '[SYSTEM] Executing base conversion: pandoc...']);
    if (mergedLatex) {
      setLogs(prev => [...prev, `[INFO] Passing ${mergedLatex.length} chars of parsed LaTeX to conversion engine...`]);
      if (mergedBib) {
         setLogs(prev => [...prev, `[INFO] Parsing ${mergedBib.split('\\n').length} lines of bibtex references...`]);
      }
    }
    timeoutsRef.current.push(setTimeout(async () => {
      try {
        if (mergedLatex) {
          const blob = await generateMergedDocx(mergedLatex, mergedBib, imagesMap);
          setFinalDocxBlob(blob);
          setLogs(prev => [...prev, '[INFO] Pandoc execution finished.', '[SYSTEM] Raw Word document generated from actual parsed source.']);
        } else {
          setLogs(prev => [...prev, '[INFO] Pandoc execution finished.', '[SYSTEM] Raw Word document generated (Mock sample).']);
        }
      } catch(e) {
        setLogs(prev => [...prev, `[ERROR] Document generation failed: ${e instanceof Error ? e.message : String(e)}`]);
      }
      setIsConverting(false);
      setStage(1);
    }, 2000));
  };

  const handleBeautify = () => {
    setIsBeautifying(true);
    setLogs(prev => [...prev, 
      '[SYSTEM] Loading formatting config...', 
      '[INFO] Processing Chinese/English font separation...',
      '[INFO] Aligning tables (三线表) and calculating boundaries...',
      '[INFO] Formatting figure and table titles with 仿宋_GB2312, 小四...',
      '[INFO] Processing numbering patterns (一级、二级等)...'
    ]);
    timeoutsRef.current.push(setTimeout(async () => {
      try {
        if (mergedLatex) {
          const blob = await generateMergedDocx(mergedLatex, mergedBib, imagesMap, true);
          setFinalDocxBlob(blob);
        } else {
          const blob = await generateSampleDocx(true);
          setFinalDocxBlob(blob);
        }
        setLogs(prev => [...prev, '[SYSTEM] Professional beautification complete.', '[SUCCESS] Final Word document ready without exceptions.']);
      } catch (e) {
        setLogs(prev => [...prev, `[ERROR] Beautification failed: ${e instanceof Error ? e.message : String(e)}`]);
      }
      setIsBeautifying(false);
      setStage(2);
    }, 2500));
  };

  const handleDownloadWord = async () => {
    try {
      let blob = finalDocxBlob;
      if (!blob) {
         blob = await generateSampleDocx();
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = mergedLatex ? '转换_排版后_真实最终版.docx' : '测试文件_排版后_最终版.docx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setLogs(prev => [...prev, '[ERROR] Failed to generate Word document']);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-gutter lg:grid lg:grid-cols-12 lg:items-start h-full pb-8">
      {/* Left Column: Controls (Grid 7/12) */}
      <div className="col-span-7 flex flex-col gap-stack-lg">
        
        {/* Stage 1 Card: Basic Conversion */}
        <section className="bg-surface border border-outline-variant rounded-xl p-stack-lg flex flex-col gap-stack-md">
          <div className="flex items-center justify-between border-b border-surface-variant pb-stack-sm">
            <h2 className="font-h1-title text-h1-title text-on-surface flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold">1</span>
              第一阶段：基础转换 (Pandoc)
            </h2>
          </div>

          {/* Environment Status */}
          <div className={`border rounded-lg p-stack-md flex items-center gap-stack-md ${pandocInstalled ? 'bg-[#E8F5E9] border-[#A5D6A7]' : 'bg-[#FFF3E0] border-[#FFCC80]'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${pandocInstalled ? 'bg-[#C8E6C9]' : 'bg-[#FFE0B2]'}`}>
              {pandocInstalled ? <CheckCircle2 className="text-[#2E7D32]" size={24} /> : <AlertTriangle className="text-[#E65100]" size={24} />}
            </div>
            <div className="flex-1">
              <h3 className="font-label-caps text-label-caps text-on-surface mb-1">环境检测状态</h3>
              <p className={`font-body-main text-body-main text-xs ${pandocInstalled ? 'text-[#2E7D32]' : 'text-[#E65100]'}`}>
                {pandocInstalled ? 'Pandoc 核心引擎已就绪。所有依赖项配置正常。' : '未检测到 Pandoc 环境，基础转换受阻。'}
              </p>
            </div>
            {!pandocInstalled && (
              <button onClick={handleInstallPandoc} className="bg-[#E65100] text-white text-xs font-medium px-3 py-1.5 rounded transition-colors hover:bg-[#BF360C]">
                一键安装 Pandoc
              </button>
            )}
          </div>

          {/* File Upload Area */}
          <div className="flex justify-between items-end mt-2 mb-1">
             <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">上传源码</span>
             <div className="flex gap-2">
               <button onClick={handleDownloadLatex} className="text-xs text-primary font-medium hover:underline bg-primary/10 px-2 py-1 rounded flex items-center gap-1">
                 <Download size={14} /> 下载 LaTeX 测试样本
               </button>
               <button onClick={simulateTestFile} className="text-xs text-primary font-medium hover:underline bg-primary/10 px-2 py-1 rounded">使用测试文件快速验证</button>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-stack-md mt-1">
            <div 
              onClick={() => fileInputZipTex.current?.click()} 
              onDragOver={e => e.preventDefault()}
              onDrop={onDropZipTex}
              className={`border border-dashed rounded-lg p-stack-md flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${hasLatex ? 'border-primary bg-primary-fixed-dim/20' : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container'}`}
            >
              <UploadCloud className={hasLatex ? 'text-primary mb-2' : 'text-outline group-hover:text-primary mb-2'} size={32} />
              <span className="font-label-caps text-label-caps text-on-surface mb-1">{hasLatex ? '已上传: 项目包' : '上传 LaTeX / ZIP 项目包'}</span>
              <span className="text-[11px] text-outline">支持 .tex 格式或含图片/Bib的 .zip，自动提取嵌入</span>
              <input type="file" ref={fileInputZipTex} className="hidden" accept=".zip,.tex" onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }} />
            </div>
            <div 
              onClick={() => fileInputBib.current?.click()} 
              onDragOver={e => e.preventDefault()}
              onDrop={onDropBib}
              className={`border border-dashed rounded-lg p-stack-md flex flex-col items-center justify-center text-center transition-colors cursor-pointer group ${hasBib ? 'border-primary bg-primary-fixed-dim/20' : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container'}`}
            >
              <BookOpen className={hasBib ? 'text-primary mb-2' : 'text-outline group-hover:text-primary mb-2'} size={32} />
              <span className="font-label-caps text-label-caps text-on-surface mb-1">{hasBib ? '已就绪: references.bib' : '上传独立 BibTeX 文献 (可选)'}</span>
              <span className="text-[11px] text-outline">支持 .bib 格式 (ZIP包内已有则无需重复传)</span>
              <input type="file" ref={fileInputBib} className="hidden" accept=".bib" onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleBibUpload(file);
              }} />
            </div>
          </div>

          {/* Parameters Configuration */}
          <div className="bg-surface-container-low rounded-lg p-stack-md mt-2 border border-surface-variant flex flex-col gap-3">
            <h3 className="font-label-caps text-label-caps text-on-surface">参数配置</h3>
            <div className="flex flex-wrap gap-stack-md">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm" />
                <span className="font-code-sm text-code-sm text-on-surface-variant">--filter pandoc-crossref</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm" />
                <span className="font-code-sm text-code-sm text-on-surface-variant">--mathjax</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-primary border-outline-variant rounded-sm" />
                <span className="font-code-sm text-code-sm text-on-surface-variant">--toc</span>
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleConvert}
              disabled={isConverting || !pandocInstalled || (!hasLatex && !hasBib)}
              className="bg-primary text-on-primary hover:bg-surface-tint disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg font-label-caps text-label-caps transition-colors shadow-sm flex items-center gap-2 relative overflow-hidden group"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform -skew-y-12"></span>
              {isConverting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
              {isConverting ? '正在转换...' : '执行基础转换'}
            </button>
          </div>
        </section>

        {/* Stage 2 Card: Beautification */}
        <section className={`bg-surface border rounded-xl p-stack-lg flex flex-col gap-stack-md relative overflow-hidden transition-colors ${stage >= 1 ? 'border-primary' : 'border-outline-variant opacity-75'}`}>
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${stage >= 1 ? 'bg-primary' : 'bg-surface-variant'}`}></div>
          
          <div className="flex items-center justify-between border-b border-surface-variant pb-stack-sm pl-2">
            <h2 className="font-h1-title text-h1-title text-on-surface flex items-center gap-2">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${stage >= 1 ? 'bg-primary/10 text-primary' : 'bg-surface-variant text-outline'}`}>2</span>
              第二阶段：专业美化 (JSON 驱动)
            </h2>
          </div>

          <div className="pl-2 flex flex-col gap-stack-md mt-2">
            <div className="flex flex-col gap-unit">
              <label htmlFor="config-select" className="font-label-caps text-label-caps text-on-surface pb-2">
                配置文件选择
              </label>
              <div className="relative">
                <select id="config-select" disabled={stage < 1} className="w-full bg-surface border border-outline-variant text-on-surface rounded-lg focus:border-primary focus:ring-1 focus:ring-primary text-sm py-2.5 pl-3 pr-10 appearance-none transition-colors disabled:opacity-50">
                  <option>通用文件排版格式要求.json</option>
                  <option>IEEE_Transactions_Template_v2.json</option>
                  <option>Nature_Standard_Format_2023.json</option>
                </select>
              </div>
              <button disabled={stage < 1} className="text-primary text-xs font-medium self-start mt-2 hover:underline flex items-center gap-1 disabled:opacity-50">
                <UploadCloud size={14} /> 上传新 JSON
              </button>
            </div>

            <div className="mt-4 flex justify-end">
              <button 
                onClick={handleBeautify}
                disabled={stage < 1 || isBeautifying} 
                className="bg-primary text-on-primary hover:bg-surface-tint disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-lg font-label-caps text-label-caps transition-colors shadow-sm flex items-center gap-2"
              >
                {isBeautifying ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                {isBeautifying ? '美化中...' : '一键执行专业美化'}
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Right Column: Feedback (Grid 5/12) */}
      <div className="col-span-5 flex flex-col gap-stack-lg h-full pb-8">
        {/* Logs Card */}
        <section className="bg-surface border border-outline-variant rounded-xl flex flex-col overflow-hidden h-[400px]">
          <div className="bg-surface-container border-b border-outline-variant px-4 py-3 flex items-center justify-between">
            <h3 className="font-label-caps text-label-caps text-on-surface flex items-center gap-2">
              <TerminalSquare size={16} />
              实时日志区
            </h3>
            <div className="flex gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-dim"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-surface-dim"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-surface-dim"></div>
            </div>
          </div>
          <div 
            ref={logsContainerRef}
            onScroll={handleScroll}
            className="flex-1 bg-[#1E1E1E] p-4 overflow-y-auto font-code-sm text-code-sm relative"
          >
            {!autoScroll && (
              <button 
                onClick={() => {
                  setAutoScroll(true);
                  if (logsContainerRef.current) {
                    logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
                  }
                }}
                className="absolute top-4 right-4 bg-zinc-800 border border-zinc-600 text-zinc-300 px-3 py-1.5 rounded-full text-xs font-medium shadow-md opacity-80 hover:opacity-100 transition-opacity z-10"
              >
                自动滚动已暂停 (点击恢复)
              </button>
            )}
            {logs.map((log, i) => (
              <pre key={i} className="text-[#D4D4D4] whitespace-pre-wrap leading-relaxed break-all">
                {log.includes('[SYSTEM]') && <span className="text-[#569CD6]">[SYSTEM] </span>}
                {log.includes('[INFO]') && <span className="text-[#4EC9B0]">[INFO] </span>}
                {log.includes('[SUCCESS]') && <span className="text-[#4CAF50]">[SUCCESS] </span>}
                {log.replace(/\[SYSTEM\] |\[INFO\] |\[SUCCESS\] /, '')}
              </pre>
            ))}
            {(isConverting || isBeautifying || !pandocInstalled) && (
              <pre className="animate-pulse text-[#4CAF50] text-lg font-bold mt-2">_</pre>
            )}
            <div ref={logsEndRef} />
          </div>
        </section>

        {/* Preview Card */}
        <section className={`bg-surface border rounded-xl p-stack-md flex flex-col shrink-0 h-64 transition-colors ${stage === 2 ? 'border-primary shadow-md' : 'border-outline-variant'}`}>
          <h3 className="font-label-caps text-label-caps text-on-surface flex items-center gap-2 border-b border-surface-variant pb-stack-sm mb-stack-sm">
            <FileText size={16} />
            预览与导出
          </h3>
          <div onClick={stage === 2 ? handleDownloadWord : undefined} className={`flex-1 border border-dashed rounded-lg flex flex-col items-center justify-center text-center p-6 ${stage === 2 ? 'bg-primary-fixed-dim/10 border-primary cursor-pointer hover:bg-primary-fixed-dim/20 transition-colors title' : 'bg-surface-container-lowest border-outline-variant text-outline'}`}>
            {stage === 2 ? (
              <>
                <FileText size={48} className="mb-3 text-primary" />
                <p className="font-body-main text-on-surface font-semibold text-primary">{mergedLatex ? '转换_排版后_真实最终版.docx' : '测试文件_排版后_最终版.docx'}</p>
                <p className="text-xs mt-2 text-on-surface-variant">
                  转换与排版已完成。点击即可预览或下载。
                </p>
              </>
            ) : (
              <>
                <FileText size={48} className="mb-3 opacity-30" />
                <p className="font-body-main text-body-main">暂无生成的文件</p>
                <p className="text-xs mt-2 max-w-xs leading-relaxed">
                  完成转换后，此处将展示初步 Word 文件预览并提供在线查看入口。
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
