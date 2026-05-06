## 架构设计

学术精准系统的项目管理和版本控制模块采用前后端分离的组件化架构，通过React hooks实现状态管理，提供项目全生命周期管理和配置版本追踪功能。

### 核心组件架构

```mermaid
graph TB
    subgraph "项目管理系统"
        PM[ProjectManagement<br/>项目状态追踪] --> PS[ProjectState<br/>useState管理]
        PM --> PF[ProjectFilter<br/>状态过滤]
        PM --> PO[ProjectOperations<br/>增删改查]
    end
    
    subgraph "版本控制系统"
        VC[VersionControl<br/>版本对比] --> VS[VersionState<br/>历史记录]
        VC --> VD[VisualDiff<br/>差异可视化]
        VC --> VR[RestoreEngine<br/>版本恢复]
    end
    
    subgraph "数据存储层"
        LS[LocalStorage<br/>项目持久化]
        CM[ConfigManager<br/>配置管理]
    end
    
    PM --> LS
    VC --> CM
    PS --> LS
    VS --> CM
```

## 项目管理核心功能

### 项目状态追踪

系统采用状态机模式管理项目生命周期，支持四种核心状态：

| 状态类型 | 标识符 | 视觉特征 | 可执行操作 |
|---------|--------|----------|-----------|
| **草稿** | `draft` | 灰色圆点 | 编辑、启动、删除 |
| **排版中** | `converting` | 蓝色脉冲圆点 | 编辑、启动、删除 |
| **已完成** | `completed` | 绿色圆点 | 查看报告、删除 |
| **归档** | `archived` | 透明度80% | 恢复、删除 |

### 项目数据结构

```typescript
interface AcademicProject {
  id: number;              // 项目唯一标识
  name: string;            // 项目名称
  path: string;            // 文件路径
  config: string;          // 配置文件名
  target: string;          // 目标期刊
  status: 'draft' | 'converting' | 'completed';  // 当前状态
  statusText: string;      // 状态显示文本
  lastModified: string;    // 最后修改时间
  author: string;          // 修改者
}
```

**来源**: [ProjectManagement.tsx](src/pages/ProjectManagement.tsx#L8-L22)

### 交互操作体系

项目管理界面提供丰富的交互功能：

```mermaid
stateDiagram-v2
    [*] --> Idle: 项目加载完成
    
    Idle --> Filtering: 用户选择过滤器
    Filtering --> Idle: 过滤结果返回
    
    Idle --> Searching: 关键词搜索
    Searching --> Idle: 搜索结果返回
    
    Idle --> Editing: 点击编辑参数
    Editing --> Processing: 提交配置变更
    Processing --> Idle: 更新完成
    
    Idle --> Executing: 启动渲染任务
    Executing --> Converting: 任务进入队列
    Converting --> Idle: 转换完成
    
    Idle --> Duplicating: 创建项目副本
    Duplicating --> Idle: 副本创建成功
    
    Idle --> Deleting: 确认删除操作
    Deleting --> [*]: 项目移除
```

## 版本控制系统

### 差异可视化引擎

版本控制模块采用语法高亮的diff展示，支持JSON格式的配置对比：

```mermaid
graph LR
    subgraph "版本选择器"
        VS1[版本v1.9] --> CM[ComparisonEngine]
        VS2[版本v2.0] --> CM
    end
    
    CM --> DIFF[DiffGenerator<br/>差异计算]
    DIFF --> VISUAL[VisualRenderer<br/>可视化渲染]
    
    VISUAL --> DELETE[删除行<br/>红色高亮]
    VISUAL --> ADD[新增行<br/>绿色高亮]
    VISUAL --> UNCHANGED[未变更<br/>默认样式]
    
    VISUAL --> SUMMARY[ChangeSummary<br/>变更摘要]
```

**来源**: [VersionControl.tsx](src/pages/VersionControl.tsx#L55-L95)

### 版本恢复机制

系统提供一键版本恢复功能，包含以下步骤：

1. **版本选择**：从历史记录中选择目标版本
2. **差异分析**：计算当前配置与目标版本的差异
3. **用户确认**：显示变更摘要并请求确认
4. **配置回滚**：将配置恢复到选定版本
5. **状态同步**：更新UI状态并通知其他组件

### 版本数据结构

```typescript
interface ConfigVersion {
  id: string;              // 版本标识 (v1.0, v2.0)
  date: string;            // 创建时间
  desc: string;            // 版本描述
  current: boolean;        // 是否为当前版本
  configSnapshot: any;     // 配置快照
}
```

**来源**: [VersionControl.tsx](src/pages/VersionControl.tsx#L8-L11)

## 集成与导航

### 系统导航结构

```mermaid
graph TD
    ROOT[App.tsx] --> SIDEBAR[Sidebar<br/>导航菜单]
    SIDEBAR --> PM_TAB[项目管理<br/>projects]
    SIDEBAR --> VC_TAB[版本控制<br/>versions]
    
    PM_TAB --> PM_Component[ProjectManagement]
    VC_TAB --> VC_Component[VersionControl]
    
    subgraph "相关功能页面"
        FORMAT[格式设置]
        WORKFLOW[工作流枢纽]
        REFERENCES[参考文献库]
    end
    
    PM_Component --> FORMAT
    PM_Component --> WORKFLOW
    VC_Component --> FORMAT
```

**来源**: [App.tsx](src/App.tsx#L1-L41)

### 状态管理架构

系统采用React useState进行组件级状态管理：

- **ProjectManagement**: 管理项目列表、过滤状态、搜索关键词
- **VersionControl**: 管理版本历史、选中版本、差异显示
- **App**: 管理当前激活的标签页，协调各模块通信

## 最佳实践建议

### 项目管理工作流程

1. **创建项目**：从工作流枢纽创建新项目，配置目标期刊模板
2. **配置格式**：在格式设置页面调整排版参数
3. **版本快照**：关键配置变更后创建版本标记
4. **监控状态**：在项目管理页面跟踪转换进度
5. **恢复版本**：如遇到问题，使用版本控制恢复到稳定状态

### 版本管理策略

- **里程碑标记**：在重要配置变更后创建版本（如`v1.0_初始配置`）
- **描述规范**：使用清晰的版本描述，便于后续识别
- **定期清理**：归档已完成项目的历史版本，保持系统性能
- **差异审查**：在恢复版本前仔细审查差异报告

## 技术实现要点

### 性能优化

- **虚拟滚动**：项目列表支持大量项目的高效渲染
- **差异算法**：使用高效的diff算法计算配置变更
- **状态持久化**：项目状态自动保存到本地存储

### 用户体验

- **实时状态更新**：项目状态实时显示，无需手动刷新
- **操作反馈**：所有用户操作提供即时反馈
- **视觉层次**：通过颜色、图标和动画创建清晰的视觉层次

---

**下一步学习路径**: 
- 了解[工作流枢纽：文档转换核心](5-gong-zuo-liu-shu-niu-wen-dang-zhuan-huan-he-xin)以理解项目创建流程
- 探索[格式设置：精细化排版控制](8-ge-shi-she-zhi-jing-xi-hua-pai-ban-kong-zhi)以掌握配置参数
- 深入学习[参考文献库管理](7-can-kao-wen-xian-ku-guan-li)以完善项目管理