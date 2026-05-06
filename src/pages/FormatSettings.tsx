import React, { useState, useRef } from 'react';
import { Settings2, Type, FileText, Check, Save, Download, Upload } from 'lucide-react';

export function FormatSettings() {
  const [fonts, setFonts] = useState({
    cn: '仿宋_GB2312',
    en: 'Times New Roman',
    size: '三号'
  });
  
  const [headings, setHeadings] = useState([
    { level: '一级标题', defaultPattern: '一、', font: '黑体', size: '三号', weight: 'bold', align: 'center' },
    { level: '二级标题', defaultPattern: '（一）', font: '楷体_GB2312', size: '三号', weight: 'normal', align: 'left' },
    { level: '三级标题', defaultPattern: '1．', font: '仿宋_GB2312', size: '三号', weight: 'bold', align: 'left' },
    { level: '四级标题', defaultPattern: '（1）', font: '仿宋_GB2312', size: '三号', weight: 'normal', align: 'left' }
  ]);

  const [page, setPage] = useState({
    top: 3.4,
    bottom: 3.5,
    left: 2.6,
    right: 2.5,
    columns: 1
  });

  const [paragraph, setParagraph] = useState({
    spaceBefore: 0,
    spaceAfter: 0,
    lineSpacingType: '固定值',
    lineSpacingValue: 28,
  });

  const [graphics, setGraphics] = useState({
    tables: {
      auto_three_line: true,
      align: 'center',
      title_position: 'top'
    },
    images: {
      align: 'center',
      title_position: 'bottom'
    },
    captions: {
      font_family_cn: '仿宋_GB2312',
      size: '小四',
      align: 'center'
    }
  });

  const [standards, setStandards] = useState({
    smart_quotes: true,
    formulas: {
      align: 'center',
      number_align: 'right',
      italic_variables: true,
      bold_italic_vectors: true
    },
    references: {
      style: 'GB/T 7714-2015',
      font: '五号',
      family_cn: '宋体',
      family_en: 'Times New Roman'
    }
  });

  const [frontmatter, setFrontmatter] = useState({
    title: { font: '黑体', size: '二号', weight: 'bold', align: 'center' },
    authors: { font: '宋体', size: '四号', weight: 'normal', align: 'center' },
    affiliations: { font: '宋体', size: '五号', weight: 'normal', align: 'center' },
    abstract: { font: '楷体_GB2312', size: '五号', weight: 'normal', align: 'left', columns: 1 },
    keywords: { font: '楷体_GB2312', size: '五号', weight: 'normal', align: 'left' }
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    // Generate the complete JSON integrating all configs
    const data = JSON.stringify({ 
      fonts, 
      headings, 
      graphics: {
         tables: {
           auto_three_line: true,
           align: "center",
           title_position: "top"
         },
         images: {
           align: "center",
           title_position: "bottom"
         },
         captions: {
           font_family_cn: "仿宋_GB2312",
           size: "小四",
           align: "center"
         }
      },
      auto_symbols: {
        convert_quotes: true
      }
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '排版配置_专业版.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          if (json.fonts) setFonts(json.fonts);
          if (json.headings) setHeadings(json.headings);
          alert('配置导入成功！');
        } catch (error) {
          alert('JSON 解析失败，请检查文件格式。');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSave = () => {
    alert('配置已保存！');
  };

  const mapFontToCSS = (fontName: string) => {
    switch (fontName) {
      case '方正小标宋简体': return '"FZXiaoBiaoSong-B05S", serif';
      case '黑体': return '"SimHei", sans-serif';
      case '楷体_GB2312': return '"KaiTi_GB2312", "KaiTi", serif';
      case '仿宋_GB2312': return '"FangSong_GB2312", "FangSong", serif';
      case '宋体': return '"SimSun", serif';
      case 'Times New Roman': return '"Times New Roman", Times, serif';
      case 'Arial': return 'Arial, sans-serif';
      default: return 'sans-serif';
    }
  };

  const mapSizeToCSS = (sizeName: string) => {
    switch (sizeName) {
      case '二号': return '22pt';
      case '小二': return '18pt';
      case '三号': return '16pt';
      case '小三': return '15pt';
      case '四号': return '14pt';
      case '小四': return '12pt';
      default: return '16pt';
    }
  };

  return (
    <React.Fragment>
    <div className="flex gap-gutter h-full pb-8">
      {/* Left Column: Settings Form */}
      <div className="w-7/12 flex flex-col gap-stack-md mt-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="font-h1-title text-[28px] font-bold text-on-surface">智能排版参数设置</h1>
            <p className="text-on-surface-variant mt-2 text-sm">精细化控制文档生成规则，支持中英文字体隔离和自定义序号排版。</p>
          </div>
          <div className="flex gap-3">
            <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
            <button onClick={() => fileInputRef.current?.click()} className="border border-primary-container text-primary-container hover:bg-surface-container py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
              <Upload size={16} />
              导入 JSON
            </button>
            <button onClick={handleExport} className="border border-primary-container text-primary-container hover:bg-surface-container py-1.5 px-4 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium">
              <Download size={16} />
              导出 JSON
            </button>
          </div>
        </div>

        {/* 页面设置 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
          <h2 className="font-label-caps text-label-caps text-primary mb-4 flex items-center gap-2 border-b border-surface-container-high pb-2">
            <FileText size={16} /> 页面设置
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">纸型</label>
              <select className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 outline-none">
                <option>A4 (210 × 297 mm)</option>
                <option>A5 (148 × 210 mm)</option>
                <option>B5 (176 × 250 mm)</option>
              </select>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">分栏</label>
                <select 
                  value={page.columns}
                  onChange={(e) => setPage({...page, columns: parseInt(e.target.value)})}
                  className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary focus:ring-1 outline-none"
                >
                  <option value={1}>单栏</option>
                  <option value={2}>双栏</option>
                  <option value={3}>三栏</option>
                </select>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">上边距 (cm)</label>
                <input type="number" value={page.top} onChange={e => setPage({...page, top: parseFloat(e.target.value)})} step="0.1" className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">下边距 (cm)</label>
                <input type="number" value={page.bottom} onChange={e => setPage({...page, bottom: parseFloat(e.target.value)})} step="0.1" className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">左边距 (cm)</label>
                <input type="number" value={page.left} onChange={e => setPage({...page, left: parseFloat(e.target.value)})} step="0.1" className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">右边距 (cm)</label>
                <input type="number" value={page.right} onChange={e => setPage({...page, right: parseFloat(e.target.value)})} step="0.1" className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none" />
              </div>
            </div>
        </div>

        {/* 多级标题与序号配置 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
          <h2 className="font-label-caps text-label-caps text-primary mb-4 flex items-center gap-2 border-b border-surface-container-high pb-2">
            <Type size={16} /> 多级标题与智能序号配置
          </h2>
          <div className="space-y-3">
            {headings.map((cfg, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-surface p-3 rounded border border-outline-variant">
                <span className="w-16 text-sm font-medium">{cfg.level}</span>
                <input 
                  type="text" 
                  value={cfg.defaultPattern}
                  onChange={(e) => {
                    const newHeadings = [...headings];
                    newHeadings[idx].defaultPattern = e.target.value;
                    setHeadings(newHeadings);
                  }}
                  className="w-16 bg-white border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary"
                  placeholder="序号" 
                />
                <select 
                  value={cfg.font}
                  onChange={(e) => {
                    const newHeadings = [...headings];
                    newHeadings[idx].font = e.target.value;
                    setHeadings(newHeadings);
                  }}
                  className="w-32 bg-white border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option>方正小标宋简体</option>
                  <option>黑体</option>
                  <option>楷体_GB2312</option>
                  <option>仿宋_GB2312</option>
                </select>
                <select 
                  value={cfg.size}
                  onChange={(e) => {
                    const newHeadings = [...headings];
                    newHeadings[idx].size = e.target.value;
                    setHeadings(newHeadings);
                  }}
                  className="w-20 bg-white border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option>二号</option>
                  <option>三号</option>
                  <option>小三</option>
                  <option>四号</option>
                  <option>小四</option>
                </select>
                <select 
                  value={cfg.weight}
                  onChange={(e) => {
                    const newHeadings = [...headings];
                    newHeadings[idx].weight = e.target.value;
                    setHeadings(newHeadings);
                  }}
                  className="w-20 bg-white border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary"
                >
                  <option value="normal">常规</option>
                  <option value="bold">加粗</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant ml-auto">
                  <input 
                    type="checkbox" 
                    checked={cfg.align === 'center'} 
                    onChange={(e) => {
                      const newHeadings = [...headings];
                      newHeadings[idx].align = e.target.checked ? 'center' : 'left';
                      setHeadings(newHeadings);
                    }}
                    className="rounded-sm border-outline-variant text-primary" 
                  />
                  居中
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* 前置信息排版 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
          <h2 className="font-label-caps text-label-caps text-primary mb-4 flex items-center gap-2 border-b border-surface-container-high pb-2">
            <Type size={16} /> 论文前置信息排版
          </h2>
          <div className="space-y-4">
            {(Object.entries(frontmatter) as [keyof typeof frontmatter, any][]).map(([key, cfg]) => (
              <div key={key} className="flex flex-wrap items-center gap-3 bg-surface p-3 rounded border border-outline-variant">
                <span className="w-16 text-sm font-medium">
                  {key === 'title' ? '文章标题' :
                   key === 'authors' ? '作者团队' :
                   key === 'affiliations' ? '所属单位' :
                   key === 'abstract' ? '中文摘要' :
                   key === 'keywords' ? '关键词' : key}
                </span>
                <select 
                  value={cfg.font} 
                  onChange={e => setFrontmatter({...frontmatter, [key]: {...cfg, font: e.target.value}})}
                  className="bg-surface border border-outline-variant rounded px-2 py-1 text-sm outline-none focus:border-primary"
                >
                  <option>黑体</option>
                  <option>宋体</option>
                  <option>楷体_GB2312</option>
                  <option>仿宋_GB2312</option>
                  <option>Times New Roman</option>
                </select>
                <select 
                  value={cfg.size} 
                  onChange={e => setFrontmatter({...frontmatter, [key]: {...cfg, size: e.target.value}})}
                  className="bg-surface border border-outline-variant rounded px-2 py-1 text-sm outline-none focus:border-primary"
                >
                  <option>二号</option>
                  <option>小二</option>
                  <option>三号</option>
                  <option>四号</option>
                  <option>小四</option>
                  <option>五号</option>
                  <option>小五</option>
                </select>
                <label className="flex items-center gap-1 text-sm">
                  <input 
                    type="checkbox" 
                    checked={cfg.weight === 'bold'}
                    onChange={e => setFrontmatter({...frontmatter, [key]: {...cfg, weight: e.target.checked ? 'bold' : 'normal'}})}
                    className="rounded-sm border-outline-variant" 
                  /> 
                  加粗
                </label>
                <div className="flex bg-surface-container border border-outline-variant rounded overflow-hidden">
                  <button 
                    onClick={() => setFrontmatter({...frontmatter, [key]: {...cfg, align: 'left'}})}
                    className={`px-3 py-1 text-xs font-medium transition-colors ${cfg.align === 'left' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-variant'}`}
                  >左对齐</button>
                  <button 
                    onClick={() => setFrontmatter({...frontmatter, [key]: {...cfg, align: 'center'}})}
                    className={`px-3 py-1 text-xs font-medium border-l border-outline-variant transition-colors ${cfg.align === 'center' ? 'bg-primary text-white' : 'text-on-surface hover:bg-surface-variant'}`}
                  >居中</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 字体与段落 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
          <h2 className="font-label-caps text-label-caps text-primary mb-4 flex items-center gap-2 border-b border-surface-container-high pb-2">
            <Type size={16} /> 字体与段落基础设置
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">正文中文字体 (Chinese)</label>
                <select 
                  value={fonts.cn}
                  onChange={e => setFonts({...fonts, cn: e.target.value})}
                  className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option>仿宋_GB2312</option>
                  <option>宋体</option>
                  <option>黑体</option>
                  <option>楷体_GB2312</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">正文西文字体 (English/Numbers)</label>
                <select 
                  value={fonts.en}
                  onChange={e => setFonts({...fonts, en: e.target.value})}
                  className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option>Times New Roman</option>
                  <option>Arial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">正文字号</label>
                <select 
                  value={fonts.size}
                  onChange={e => setFonts({...fonts, size: e.target.value})}
                  className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option>二号</option>
                  <option>小二</option>
                  <option>三号</option>
                  <option>小三</option>
                  <option>四号</option>
                  <option>小四</option>
                  <option>五号</option>
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">段前间距 (行)</label>
                  <input type="number" value={paragraph.spaceBefore} onChange={e => setParagraph({...paragraph, spaceBefore: parseFloat(e.target.value)})} step="0.5" className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">段后间距 (行)</label>
                  <input type="number" value={paragraph.spaceAfter} onChange={e => setParagraph({...paragraph, spaceAfter: parseFloat(e.target.value)})} step="0.5" className="w-full bg-surface border border-outline-variant rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-on-surface-variant mb-1.5 font-label-caps">行距 (磅)</label>
                <div className="flex items-center gap-3">
                  <select 
                    value={paragraph.lineSpacingType} 
                    onChange={e => {
                      const newType = e.target.value;
                      let newValue = paragraph.lineSpacingValue;
                      if (newType === '单倍行距') newValue = 1.0;
                      else if (newType === '1.5倍行距') newValue = 1.5;
                      else if (newType === '2倍行距') newValue = 2.0;
                      setParagraph({...paragraph, lineSpacingType: newType, lineSpacingValue: newValue});
                    }} 
                    className="w-1/2 bg-surface border border-outline-variant rounded px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option>固定值</option>
                    <option>单倍行距</option>
                    <option>1.5倍行距</option>
                    <option>2倍行距</option>
                    <option>多倍行距</option>
                  </select>
                  <input 
                    type="number" 
                    value={paragraph.lineSpacingValue} 
                    onChange={e => setParagraph({...paragraph, lineSpacingValue: parseFloat(e.target.value)})} 
                    disabled={paragraph.lineSpacingType === '单倍行距' || paragraph.lineSpacingType === '1.5倍行距' || paragraph.lineSpacingType === '2倍行距'}
                    className="w-1/2 bg-surface border border-outline-variant rounded px-3 py-2 text-sm focus:border-primary outline-none disabled:opacity-50 disabled:bg-slate-100" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 其他排版规则 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
          <h2 className="font-label-caps text-label-caps text-primary mb-4 flex items-center gap-2 border-b border-surface-container-high pb-2">
            <Check size={16} /> 智能规范转换
          </h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 bg-surface border border-outline-variant rounded cursor-pointer hover:bg-surface-container-low transition-colors">
              <input type="checkbox" defaultChecked className="rounded-sm border-outline-variant text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-on-surface">智能引号转换</span>
                <span className="text-[13px] text-on-surface-variant mt-0.5">将半角双引号（英文格式）"..." 自动替换成全角双引号（中文格式）“...”</span>
              </div>
            </label>
          </div>
        </div>

        {/* 图表与参考文献 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm">
          <h2 className="font-label-caps text-label-caps text-primary mb-4 flex items-center gap-2 border-b border-surface-container-high pb-2">
            <Settings2 size={16} /> 图表配置
          </h2>
          
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-on-surface mb-2">表格排版</h3>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={graphics.tables.auto_three_line} onChange={e => setGraphics({...graphics, tables: {...graphics.tables, auto_three_line: e.target.checked}})} className="rounded-sm border-outline-variant text-primary" />
                  开启三线表自动转换
                </label>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={graphics.tables.align === 'center'} onChange={e => setGraphics({...graphics, tables: {...graphics.tables, align: e.target.checked ? 'center' : 'left'}})} className="rounded-sm border-outline-variant text-primary" />
                  表格居中对齐
                </label>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">表格标题位置</label>
                  <select value={graphics.tables.title_position} onChange={e => setGraphics({...graphics, tables: {...graphics.tables, title_position: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option value="top">表格上方</option>
                    <option value="bottom">表格下方</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-on-surface mb-2">图片排版</h3>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={graphics.images.align === 'center'} onChange={e => setGraphics({...graphics, images: {...graphics.images, align: e.target.checked ? 'center' : 'left'}})} className="rounded-sm border-outline-variant text-primary" />
                  图片居中对齐
                </label>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">图片标题位置</label>
                  <select value={graphics.images.title_position} onChange={e => setGraphics({...graphics, images: {...graphics.images, title_position: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option value="bottom">图片下方</option>
                    <option value="top">图片上方</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-3">
              <h3 className="text-sm font-bold text-on-surface mb-3">图表内容与标题字体统一定义</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">中文字体</label>
                  <select value={graphics.captions.font_family_cn} onChange={e => setGraphics({...graphics, captions: {...graphics.captions, font_family_cn: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option>仿宋_GB2312</option>
                    <option>宋体</option>
                    <option>黑体</option>
                    <option>楷体_GB2312</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">字号</label>
                  <select value={graphics.captions.size} onChange={e => setGraphics({...graphics, captions: {...graphics.captions, size: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option>五号</option>
                    <option>小四</option>
                    <option>四号</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">标题对齐</label>
                  <select value={graphics.captions.align} onChange={e => setGraphics({...graphics, captions: {...graphics.captions, align: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option value="center">居中</option>
                    <option value="left">左对齐</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 公式与参考文献排版 */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 shadow-sm mb-4">
          <h2 className="font-label-caps text-label-caps text-primary mb-4 flex items-center gap-2 border-b border-surface-container-high pb-2">
            <Type size={16} /> 公式与参考文献排版
          </h2>
          
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-on-surface mb-2">公式排版规范</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={standards.formulas.align === 'center'} onChange={e => setStandards({...standards, formulas: {...standards.formulas, align: e.target.checked ? 'center' : 'left'}})} className="rounded-sm border-outline-variant text-primary" />
                  独立公式居中对齐
                </label>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={standards.formulas.number_align === 'right'} onChange={e => setStandards({...standards, formulas: {...standards.formulas, number_align: e.target.checked ? 'right' : 'left'}})} className="rounded-sm border-outline-variant text-primary" />
                  公式序号右对齐
                </label>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={standards.formulas.italic_variables} onChange={e => setStandards({...standards, formulas: {...standards.formulas, italic_variables: e.target.checked}})} className="rounded-sm border-outline-variant text-primary" />
                  物理量符号使用斜体
                </label>
                <label className="flex items-center gap-2 text-sm text-on-surface-variant">
                  <input type="checkbox" checked={standards.formulas.bold_italic_vectors} onChange={e => setStandards({...standards, formulas: {...standards.formulas, bold_italic_vectors: e.target.checked}})} className="rounded-sm border-outline-variant text-primary" />
                  矢量矩阵符号使用黑斜体
                </label>
              </div>
            </div>

            <div className="border-t border-outline-variant pt-4 space-y-3">
              <h3 className="text-sm font-bold text-on-surface mb-2">参考文献排版格式</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">引文著录标准</label>
                  <select value={standards.references.style} onChange={e => setStandards({...standards, references: {...standards.references, style: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option>GB/T 7714-2015</option>
                    <option>APA 7th</option>
                    <option>IEEE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">基础字号</label>
                  <select value={standards.references.font} onChange={e => setStandards({...standards, references: {...standards.references, font: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option>五号</option>
                    <option>小五</option>
                    <option>六号</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">中文字体</label>
                  <select value={standards.references.family_cn} onChange={e => setStandards({...standards, references: {...standards.references, family_cn: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option>宋体</option>
                    <option>仿宋_GB2312</option>
                    <option>黑体</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-medium">英文字体</label>
                  <select value={standards.references.family_en} onChange={e => setStandards({...standards, references: {...standards.references, family_en: e.target.value}})} className="w-full bg-surface border border-outline-variant rounded px-2 py-1.5 text-sm outline-none focus:border-primary">
                    <option>Times New Roman</option>
                    <option>Arial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save button CTA */}
        <div className="flex justify-end pt-4 mt-2 border-t border-outline-variant mb-8 mt-4">
          <button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-on-primary px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm">
            <Save size={18} />
            保存当前配置
          </button>
        </div>
      </div>

      {/* Right Column: Live Preview */}
      <div className="w-5/12 sticky top-0 h-[calc(100vh-theme(spacing.24))] flex flex-col pt-4 pb-8">
        <div className="bg-surface-container-low border border-outline-variant rounded-lg flex-1 flex flex-col overflow-hidden shadow-sm">
          <div className="bg-white px-5 py-4 border-b border-outline-variant flex justify-between items-center shrink-0">
            <span className="font-h1-title font-semibold text-on-surface flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              实时排版预览
            </span>
            <span className="text-xs text-outline font-code-sm bg-surface-container-highest px-2 py-1 rounded">缩放: 50%</span>
          </div>
          <div className="flex-1 overflow-y-auto bg-[#F1F5F9] flex justify-center custom-scrollbar py-8">
            {/* Simulated A4 Paper Wrapper for scaling */}
            <div 
              className="origin-top"
              style={{ transform: 'scale(0.5)', marginBottom: '-561px' }} // 1123px * 0.5 = 561px adjustments
            >
              <div className="bg-white shadow-xl w-[794px] h-[1123px] text-black border border-outline-variant relative shrink-0">
                <div 
                  className="absolute border border-dashed border-slate-300 pointer-events-none opacity-50 transition-all duration-300" 
                  style={{ 
                    top: `${page.top * 37.8}px`, 
                    bottom: `${page.bottom * 37.8}px`, 
                    left: `${page.left * 37.8}px`, 
                    right: `${page.right * 37.8}px` 
                  }}
                ></div>
                
                <div 
                  className="absolute transition-all duration-300 z-10 font-serif" 
                  style={{ 
                    top: `${page.top * 37.8}px`, 
                    bottom: `${page.bottom * 37.8}px`, 
                    left: `${page.left * 37.8}px`, 
                    right: `${page.right * 37.8}px`,
                  }}
                >
                  <div className="mb-6 flex flex-col gap-4">
                    {/* Article Title */}
                    <div 
                      style={{ 
                        fontFamily: mapFontToCSS(frontmatter.title.font),
                        fontSize: mapSizeToCSS(frontmatter.title.size),
                        fontWeight: frontmatter.title.weight,
                        textAlign: frontmatter.title.align as any
                      }}
                    >
                      基于深度学习的自然语言处理方法研究
                    </div>
                    {/* Authors */}
                    <div 
                      style={{ 
                        fontFamily: mapFontToCSS(frontmatter.authors.font),
                        fontSize: mapSizeToCSS(frontmatter.authors.size),
                        fontWeight: frontmatter.authors.weight,
                        textAlign: frontmatter.authors.align as any
                      }}
                    >
                      张三<sup className="text-[0.6em]">1</sup>, 李四<sup className="text-[0.6em]">2</sup>
                    </div>
                    {/* Affiliations */}
                    <div 
                      style={{ 
                        fontFamily: mapFontToCSS(frontmatter.affiliations.font),
                        fontSize: mapSizeToCSS(frontmatter.affiliations.size),
                        fontWeight: frontmatter.affiliations.weight,
                        textAlign: frontmatter.affiliations.align as any
                      }}
                    >
                      (1. 哈尔滨工业大学计算机学院, 深圳 518055; 2. 清华大学, 北京 100084)
                    </div>
                    {/* Abstract */}
                    <div 
                      style={{ 
                        fontFamily: mapFontToCSS(frontmatter.abstract.font),
                        fontSize: mapSizeToCSS(frontmatter.abstract.size),
                        fontWeight: frontmatter.abstract.weight,
                        textAlign: frontmatter.abstract.align as any
                      }}
                    >
                      <span className="font-bold">摘要：</span>中文摘要内容使用五号楷体。包含英文如 Transformer使用Times New Roman，单栏排版。突出结论和创新点。
                    </div>
                  </div>

                  {/* Body Content with Columns */}
                  <div style={{ 
                    columnCount: page.columns || 1, 
                    columnGap: '2em',
                    fontFamily: mapFontToCSS(fonts.cn) 
                  }}>
                    {/* Heading 1 Preview */}
                <div 
                  className={`mb-6`}
                  style={{ 
                    fontFamily: mapFontToCSS(headings[0].font),
                    fontSize: mapSizeToCSS(headings[0].size),
                    fontWeight: headings[0].weight,
                    textAlign: headings[0].align as "center" | "left" | "right"
                  }}
                >
                  {headings[0].defaultPattern} 核心算法结构设计
                </div>
                
                {/* Body Text */}
                <p 
                  className="indent-8 mb-4 transition-all duration-300" 
                  style={{ 
                    fontSize: mapSizeToCSS(fonts.size),
                    lineHeight: paragraph.lineSpacingType === '固定值' ? `${paragraph.lineSpacingValue}px` : paragraph.lineSpacingValue,
                    marginTop: `${paragraph.spaceBefore}em`,
                    marginBottom: `${paragraph.spaceAfter || 1}em`
                  }}
                >
                  在本章节中，我们将详细探讨深度学习模型在自然语言处理中的应用。如前所述，<span style={{ fontFamily: mapFontToCSS(fonts.en) }}>Transformer</span>架构彻底改变了序列建模的范式。
                </p>
                
                {/* Heading 2 Preview */}
                <div 
                  className={`mb-2 mt-4`}
                  style={{ 
                    fontFamily: mapFontToCSS(headings[1].font),
                    fontSize: mapSizeToCSS(headings[1].size),
                    fontWeight: headings[1].weight,
                    textAlign: headings[1].align as "center" | "left" | "right"
                  }}
                >
                  {headings[1].defaultPattern} 注意力机制分析
                </div>
                
                <p 
                  className="indent-8 mb-4 transition-all duration-300" 
                  style={{ 
                    fontSize: mapSizeToCSS(fonts.size),
                    lineHeight: paragraph.lineSpacingType === '固定值' ? `${paragraph.lineSpacingValue}px` : paragraph.lineSpacingValue,
                    marginTop: `${paragraph.spaceBefore}em`,
                    marginBottom: `${paragraph.spaceAfter || 1}em`
                  }}
                >
                  根据文献记录，<span style={{ fontFamily: mapFontToCSS(fonts.en) }}>Self-Attention</span>机制允许模型在处理序列时，同时考虑到上下文的所有位置信息。公式如下所示：
                </p>
                
                <div 
                  className={`bg-slate-50 p-2 mb-4 flex border border-slate-200 text-xs text-slate-700`}
                  style={{
                    justifyContent: standards.formulas.align === 'center' ? 'center' : 'flex-start',
                    fontFamily: mapFontToCSS(fonts.en) 
                  }}
                >
                  <span className="flex-1 flex items-center" style={{ justifyContent: standards.formulas.align === 'center' ? 'center' : 'flex-start' }}>
                    <span style={{ fontStyle: standards.formulas.italic_variables ? 'italic' : 'normal', fontWeight: standards.formulas.bold_italic_vectors ? 'bold' : 'normal' }}>Attention</span>
                    (Q, K, V) = softmax(QK<sup className="text-[0.6em]">T</sup> / √d_k) V
                  </span>
                  <span style={{ marginLeft: standards.formulas.number_align === 'right' ? 'auto' : '1em' }}>(1)</span>
                </div>
                
                {/* Simulated Table */}
                <div className="mt-6 mb-4 transition-all duration-300 flex flex-col" style={{ alignItems: graphics.tables.align === 'center' ? 'center' : 'flex-start' }}>
                  {graphics.tables.title_position === 'top' && (
                    <div 
                      className="mb-1 font-bold w-full" 
                      style={{ 
                        textAlign: graphics.captions.align as "center" | "left",
                        fontFamily: mapFontToCSS(graphics.captions.font_family_cn), 
                        fontSize: mapSizeToCSS(graphics.captions.size) 
                      }}
                    >表 1.1 模型性能对比</div>
                  )}
                  <table className="w-full text-center border-collapse transition-all duration-300" style={{ fontFamily: mapFontToCSS(fonts.cn), fontSize: mapSizeToCSS(fonts.size) }}>
                    <thead>
                      <tr className={graphics.tables.auto_three_line ? "border-t-[1.5px] border-b border-black" : "border border-black bg-slate-100"}>
                        <th className={`py-1 font-normal ${!graphics.tables.auto_three_line && 'border border-black'}`}>模型名称</th>
                        <th className={`py-1 font-normal ${!graphics.tables.auto_three_line && 'border border-black'}`}>准确率</th>
                        <th className={`py-1 font-normal ${!graphics.tables.auto_three_line && 'border border-black'}`}>召回率</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className={`py-1 ${!graphics.tables.auto_three_line && 'border border-black'}`} style={{ fontFamily: mapFontToCSS(fonts.en) }}>Model-A</td>
                        <td className={`py-1 ${!graphics.tables.auto_three_line && 'border border-black'}`} style={{ fontFamily: mapFontToCSS(fonts.en) }}>92.4%</td>
                        <td className={`py-1 ${!graphics.tables.auto_three_line && 'border border-black'}`} style={{ fontFamily: mapFontToCSS(fonts.en) }}>89.1%</td>
                      </tr>
                      <tr className={graphics.tables.auto_three_line ? "border-b-[1.5px] border-black" : "border border-black"}>
                        <td className={`py-1 ${!graphics.tables.auto_three_line && 'border border-black'}`} style={{ fontFamily: mapFontToCSS(fonts.en) }}>Model-B</td>
                        <td className={`py-1 ${!graphics.tables.auto_three_line && 'border border-black'}`} style={{ fontFamily: mapFontToCSS(fonts.en) }}>94.7%</td>
                        <td className={`py-1 ${!graphics.tables.auto_three_line && 'border border-black'}`} style={{ fontFamily: mapFontToCSS(fonts.en) }}>93.2%</td>
                      </tr>
                    </tbody>
                  </table>
                  {graphics.tables.title_position === 'bottom' && (
                    <div 
                      className="mt-1 font-bold w-full" 
                      style={{ 
                        textAlign: graphics.captions.align as "center" | "left",
                        fontFamily: mapFontToCSS(graphics.captions.font_family_cn), 
                        fontSize: mapSizeToCSS(graphics.captions.size) 
                      }}
                    >表 1.1 模型性能对比</div>
                  )}
                </div>

                <p 
                  className="indent-8 transition-all duration-300" 
                  style={{ 
                    fontSize: mapSizeToCSS(fonts.size),
                    lineHeight: paragraph.lineSpacingType === '固定值' ? `${paragraph.lineSpacingValue}px` : paragraph.lineSpacingValue,
                    marginTop: `${paragraph.spaceBefore}em`,
                    marginBottom: `${paragraph.spaceAfter}em`
                  }}
                >
                  正如“专家系统”在早期<span style={{ fontFamily: mapFontToCSS(fonts.en) }}>AI</span>发展中起到的作用一样，当前的预训练模型也在特定领域展现出了“超越人类”的潜力。
                </p>

                {/* References Preview */}
                <div className="mt-8 transition-all duration-300" style={{ 
                  fontSize: mapSizeToCSS(standards.references.font),
                  fontFamily: mapFontToCSS(standards.references.family_cn)
                }}>
                  <div className="font-bold mb-2">参考文献：</div>
                  <div className="pl-[2em] -indent-[2em] mb-1">
                    [1] <span style={{ fontFamily: mapFontToCSS(standards.references.family_en) }}>Vaswani A, Shazeer N, Parmar N, et al. Attention is all you need[J]. Advances in neural information processing systems, 2017, 30.</span>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </React.Fragment>
  );
}
