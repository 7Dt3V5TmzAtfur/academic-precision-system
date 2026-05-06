import React, { useState } from 'react';
import { BookMarked, Search, Plus, Filter, FileText, CheckCircle2 } from 'lucide-react';

export function ReferenceLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStyle, setActiveStyle] = useState('GB/T 7714');

  const references = [
    {
      id: 'smith2023',
      type: 'article',
      title: 'Attention is All You Need in the Next Generation',
      author: 'Smith, J. and Doe, A.',
      journal: 'Journal of Deep Learning',
      year: '2023',
      volume: '15',
      pages: '112-140'
    },
    {
      id: 'wang2022',
      type: 'inproceedings',
      title: 'A New Method for Semantic Processing',
      author: 'Wang, H. and Li, M.',
      journal: 'Proceedings of NLP Conference',
      year: '2022',
      volume: '',
      pages: '45-55'
    }
  ];

  const filteredRefs = references.filter(ref => 
    ref.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    ref.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPreview = (ref: any) => {
    if (activeStyle === 'GB/T 7714') {
      return `${ref.author.replace(' and ', ', ')}. ${ref.title}[J]. ${ref.journal}, ${ref.year}${ref.volume ? `, ${ref.volume}` : ''}: ${ref.pages}.`;
    } else if (activeStyle === 'APA') {
      return `${ref.author.replace(' and ', ' & ')} (${ref.year}). ${ref.title}. ${ref.journal}${ref.volume ? `, ${ref.volume}` : ''}, ${ref.pages}.`;
    } else if (activeStyle === 'IEEE') {
      return `${ref.author.replace(' and ', ', ')}, "${ref.title}," in ${ref.journal}, vol. ${ref.volume || '-'}, pp. ${ref.pages}, ${ref.year}.`;
    }
    return '';
  };

  const handleAdd = () => {
    alert("正在打开添加文献条目面板...");
  };

  const handleFormat = () => {
    alert(`统一格式化为您选择的标准: ${activeStyle}`);
  };

  return (
    <div className="flex flex-col h-full bg-background pb-8 pt-4">
      <header className="mb-stack-lg border-b border-surface-variant pb-stack-sm flex justify-between items-end">
        <div>
          <h1 className="font-h1-title text-[28px] font-bold text-on-surface">文献库可视化管理</h1>
          <p className="font-body-main text-on-surface-variant mt-2">在线管理 BibTeX 数据，并实时预览 GB/T 7714、APA、IEEE 等标准的渲染效果。</p>
        </div>
        <button onClick={handleAdd} className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 shadow-sm transition-colors">
          <Plus size={16} /> 新增引文条目
        </button>
      </header>

      <div className="flex gap-4 mb-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
          <input 
            type="text" 
            placeholder="搜索文献标题或作者..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full bg-white border border-outline-variant rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-outline-variant rounded-lg px-2 shadow-sm">
          <Filter className="text-on-surface-variant ml-2" size={16}/>
          <select 
            value={activeStyle}
            onChange={e => setActiveStyle(e.target.value)}
            className="bg-transparent border-none text-sm py-2 pr-4 focus:outline-none focus:ring-0 font-medium text-primary"
          >
            <option value="GB/T 7714">GB/T 7714 (国标)</option>
            <option value="APA">APA 7th Edition</option>
            <option value="IEEE">IEEE 格式</option>
          </select>
        </div>
        <button onClick={handleFormat} className="flex items-center gap-2 bg-surface text-on-surface border border-outline-variant hover:bg-surface-container px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-auto shadow-sm">
          <CheckCircle2 size={16} className="text-primary"/> 验证并对齐当前格式
        </button>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container border-b border-outline-variant text-[13px] font-semibold text-on-surface-variant shrink-0">
          <div className="col-span-2">引文键值 (Key)</div>
          <div className="col-span-4">文献标题</div>
          <div className="col-span-2">作者</div>
          <div className="col-span-4">引文样式实时预览 (<span className="text-primary">{activeStyle}</span>)</div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant">
          {filteredRefs.map(ref => (
            <div key={ref.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-start hover:bg-[#F8FAFC] transition-colors group cursor-pointer">
              <div className="col-span-2">
                <span className="font-code-sm bg-surface-container-high px-1.5 py-0.5 rounded text-xs border border-outline-variant">{ref.id}</span>
                <span className="block text-[11px] text-on-surface-variant mt-1.5 uppercase font-semibold tracking-wider">@{ref.type}</span>
              </div>
              <div className="col-span-4 pr-4">
                <h3 className="text-sm font-bold text-on-surface leading-tight">{ref.title}</h3>
                <p className="text-xs text-on-surface-variant mt-1">{ref.journal}, {ref.year}</p>
              </div>
              <div className="col-span-2 text-sm text-on-surface-variant">
                {ref.author}
              </div>
              <div className="col-span-4 text-[13px] leading-relaxed text-on-surface font-[serif] bg-[#fdfdfd] border border-outline-variant/50 p-2.5 rounded-md shadow-sm relative">
                {getPreview(ref)}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-white border border-outline-variant shadow-sm p-1 rounded hover:text-primary"><FileText size={14}/></button>
                </div>
              </div>
            </div>
          ))}
          {filteredRefs.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant">
              <BookMarked size={48} className="text-outline-variant mb-4 opacity-50" />
              <p className="font-medium">未找到匹配的文献</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
