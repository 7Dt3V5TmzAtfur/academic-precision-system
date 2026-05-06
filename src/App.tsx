import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { WorkflowHub } from './pages/WorkflowHub';
import { FormatSettings } from './pages/FormatSettings';
import { ProjectManagement } from './pages/ProjectManagement';
import { AiAnalysis } from './pages/AiAnalysis';
import { PreExportAudit } from './pages/PreExportAudit';
import { ExportLogs } from './pages/ExportLogs';
import { SystemSettings } from './pages/SystemSettings';
import { VersionControl } from './pages/VersionControl';
import { ReferenceLibrary } from './pages/ReferenceLibrary';

export type TabId = 'workflow' | 'format' | 'analysis' | 'projects' | 'audit' | 'logs' | 'settings' | 'versions' | 'references';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('workflow');

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body-main text-body-main antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 ml-64 flex flex-col relative h-full">
        <Header activeTab={activeTab} />
        
        <main className="flex-1 overflow-y-auto p-margin-page relative">
          {activeTab === 'workflow' && <WorkflowHub />}
          {activeTab === 'format' && <FormatSettings />}
          {activeTab === 'projects' && <ProjectManagement />}
          {activeTab === 'analysis' && <AiAnalysis />}
          {activeTab === 'audit' && <PreExportAudit />}
          {activeTab === 'logs' && <ExportLogs />}
          {activeTab === 'settings' && <SystemSettings />}
          {activeTab === 'versions' && <VersionControl />}
          {activeTab === 'references' && <ReferenceLibrary />}
        </main>
      </div>
    </div>
  );
}
