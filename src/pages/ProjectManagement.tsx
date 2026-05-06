import React, { useState } from 'react';
import { Search, FolderGit2, Calendar, MoreVertical, Edit2, Play, Trash2, FileText, CheckCircle2, Copy, Settings2 } from 'lucide-react';

export function ProjectManagement() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: '深度学习综述',
      path: '/projects/dl_review_2023/main.tex',
      config: 'ieee_tran.json',
      target: 'IEEE T-PAMI',
      status: 'converting',
      statusText: '排版中 (Converting)',
      lastModified: '10 分钟前',
      author: 'Dr. Wang'
    },
    {
      id: 2,
      name: '核心算法研究与应用',
      path: '/projects/core_algo_v2/paper.tex',
      config: 'nature_style.json',
      target: 'Nature Comm',
      status: 'draft',
      statusText: '草稿 (Draft)',
      lastModified: '昨天 14:30',
      author: '系统自动保存'
    },
    {
      id: 3,
      name: '自然语言处理实验数据',
      path: '/archive/nlp_exp_2022/final.tex',
      config: '',
      target: 'ACL',
      status: 'completed',
      statusText: '已完成 (Completed)',
      lastModified: '2023-10-12',
      author: 'Dr. Wang'
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('all');

  const handleDelete = (id: number) => {
    if (confirm('确认删除此项目？相关的临时文件将被清除。')) {
      setProjects(projects.filter(p => p.id !== id));
    }
  };

  const handleDuplicate = (project: any) => {
    const newProject = {
      ...project,
      id: Date.now(),
      name: `${project.name} (副本)`,
      status: 'draft',
      statusText: '草稿 (Draft)',
      lastModified: '刚刚',
    };
    setProjects([newProject, ...projects]);
  };

  const handleEdit = (name: string) => {
    alert(`进入项目配置编辑模式: ${name}`);
  };

  const handlePlay = (name: string) => {
    alert(`开始后台渲染任务: ${name}`);
  };

  const handleReport = (name: string) => {
    alert(`下载并查看报告: ${name}`);
  };

  const filteredProjects = projects.filter(p => {
    if (activeFilter === 'all') return true;
    return p.status === activeFilter;
  });

  return (
    <div className="flex flex-col h-full bg-background pb-8 pt-4">
      {/* TopAppBar Contextual Header */}
      <div className="flex justify-between items-center mb-stack-md">
        <h2 className="font-h1-title text-[28px] font-bold text-on-surface">科研项目状态追踪</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
          <input 
            type="text" 
            placeholder="检索项目、期刊或关键词..." 
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-white font-body-main text-body-main text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors shadow-sm" 
          />
        </div>
      </div>

      {/* Filters and Tools */}
      <div className="flex gap-2 mb-stack-md">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors flex items-center gap-2 ${activeFilter === 'all' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
        >
          <span>全部状态</span>
        </button>
        <button 
          onClick={() => setActiveFilter('draft')}
          className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${activeFilter === 'draft' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
        >
          草稿 ({projects.filter(p => p.status === 'draft').length})
        </button>
        <button 
          onClick={() => setActiveFilter('converting')}
          className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${activeFilter === 'converting' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
        >
          排版中 ({projects.filter(p => p.status === 'converting').length})
        </button>
        <button 
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-1.5 rounded-full font-label-caps text-label-caps border transition-colors ${activeFilter === 'completed' ? 'bg-primary text-on-primary border-primary' : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container'}`}
        >
          已完成 ({projects.filter(p => p.status === 'completed').length})
        </button>
      </div>

      {/* Project List */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container border-b border-outline-variant font-label-caps text-[13px] font-semibold text-on-surface-variant shrink-0">
          <div className="col-span-4">项目名称 & 路径</div>
          <div className="col-span-2">目标期刊模板</div>
          <div className="col-span-2">当前工作状态</div>
          <div className="col-span-2">最后修改记录</div>
          <div className="col-span-2 text-right">快捷操作</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-outline-variant overflow-y-auto">
          {filteredProjects.length === 0 ? (
             <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant">
               <FileText size={48} className="text-outline-variant mb-4 opacity-50" />
               <p className="font-medium">没有找到相关项目</p>
               <p className="text-sm mt-1">您可以调整过滤条件或创建新项目。</p>
             </div>
          ) : filteredProjects.map((project) => (
            <div key={project.id} className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#F8FAFC] transition-colors items-center group ${project.status === 'completed' ? 'opacity-80' : ''}`}>
              <div className="col-span-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${project.status === 'converting' ? 'text-primary' : project.status === 'completed' ? 'text-green-600' : 'text-on-surface-variant'}`}>
                    {project.status === 'completed' ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                  </div>
                  <div>
                    <h3 className="font-body-main text-body-main font-semibold text-on-surface tracking-tight">{project.name}</h3>
                    <div className="flex items-center gap-1.5 text-on-surface-variant mt-1.5">
                      <FolderGit2 size={14} />
                      <code className="font-code-sm text-xs bg-surface-container px-1 py-0.5 rounded">{project.path}</code>
                    </div>
                    {project.config && (
                      <div className="flex items-center gap-1.5 text-on-surface-variant mt-1.5">
                        <Settings2 size={14} />
                        <code className="font-code-sm text-xs bg-surface-container px-1 py-0.5 rounded text-primary/80">{project.config}</code>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <span className={`px-2 py-1 rounded-md font-code-sm text-xs font-semibold border ${
                  project.target === 'IEEE T-PAMI' ? 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]' : 'bg-surface-container text-on-surface-variant border-outline-variant'
                }`}>
                  {project.target}
                </span>
              </div>
              <div className="col-span-2 flex items-center">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    project.status === 'converting' ? 'bg-primary animate-pulse' :
                    project.status === 'completed' ? 'bg-green-500' : 'bg-outline'
                  }`}></span>
                  <span className={`font-label-caps text-sm font-medium ${
                    project.status === 'converting' ? 'text-primary' :
                    project.status === 'completed' ? 'text-green-700' : 'text-on-surface-variant'
                  }`}>
                    {project.statusText}
                  </span>
                </div>
              </div>
              <div className="col-span-2 flex flex-col justify-center text-on-surface-variant text-sm">
                <span className="font-medium text-on-surface">{project.lastModified}</span>
                <span className="text-[11px] mt-0.5">{project.author}</span>
              </div>
              <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {project.status !== 'completed' ? (
                  <>
                    <button onClick={() => handleEdit(project.name)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="编辑参数">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handlePlay(project.name)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="启动任务">
                      <Play size={18} />
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-md transition-colors" title="删除">
                      <Trash2 size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleReport(project.name)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="查看报告">
                      <FileText size={18} />
                    </button>
                    <button onClick={() => handleDuplicate(project)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="克隆为新版本">
                      <Copy size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-stack-md flex justify-between items-center text-sm text-on-surface-variant font-body-main pt-2">
        <div className="font-medium">共 {projects.length} 个项目，显示全部</div>
        <div className="flex gap-1">
          <button className="px-3 py-1 rounded border border-outline-variant text-outline hover:bg-surface-container disabled:opacity-50" disabled>上一页</button>
          <button className="px-3 py-1 rounded bg-primary text-on-primary border border-primary font-semibold">1</button>
          <button className="px-3 py-1 rounded border border-outline-variant hover:bg-surface-container disabled:opacity-50" disabled>下一页</button>
        </div>
      </div>
    </div>
  );
}
