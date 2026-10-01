/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppBaseState, ModuleType, TableSchema, ProjectTask, DocPage, AutomationRule, ActivityItem, TableRow } from './types';
import { INITIAL_STATE } from './sampleData';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { NewItemModal } from './components/NewItemModal';
import { ActivityDrawer } from './components/ActivityDrawer';
import { OverviewView } from './components/views/OverviewView';
import { TableView } from './components/views/TableView';
import { KanbanView } from './components/views/KanbanView';
import { DocsView } from './components/views/DocsView';
import { MetricsView } from './components/views/MetricsView';
import { AutomationsView } from './components/views/AutomationsView';

const STORAGE_KEY = 'appbase_workspace_state_v1';

export default function App() {
  const [state, setState] = useState<AppBaseState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return INITIAL_STATE;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activityDrawerOpen, setActivityDrawerOpen] = useState(false);
  const [newItemModalOpen, setNewItemModalOpen] = useState(false);
  const [newItemModalType, setNewItemModalType] = useState<'task' | 'row' | 'doc'>('task');
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }, [state]);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Workspace Switcher
  const handleSelectWorkspace = (wsId: string) => {
    setState((prev) => ({
      ...prev,
      currentWorkspaceId: wsId
    }));
    addActivity({
      user: 'You',
      action: 'switched active workspace to',
      target: state.workspaces.find(w => w.id === wsId)?.name || wsId,
      timestamp: 'Just now',
      type: 'update'
    });
  };

  // Module Navigation
  const handleSelectModule = (mod: ModuleType) => {
    setState((prev) => ({
      ...prev,
      activeModule: mod
    }));
  };

  // Document direct selection from sidebar/overview
  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    setState((prev) => ({
      ...prev,
      activeModule: 'docs'
    }));
  };

  // Activity logger helper
  const addActivity = (item: Omit<ActivityItem, 'id'>) => {
    const newItem: ActivityItem = {
      ...item,
      id: `act-${Date.now()}`
    };
    setState((prev) => ({
      ...prev,
      activities: [newItem, ...prev.activities.slice(0, 49)]
    }));
  };

  // Clear activities
  const handleClearActivities = () => {
    setState((prev) => ({
      ...prev,
      activities: []
    }));
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark'
    }));
  };

  // Reset to sample data
  const handleResetData = () => {
    if (window.confirm('Reset workspace database back to initial sample dataset?')) {
      setState(INITIAL_STATE);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
  };

  // Export full JSON database
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `appbase_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Open New Item Modal
  const handleOpenNewModal = (type: 'task' | 'row' | 'doc' = 'task') => {
    setNewItemModalType(type);
    setNewItemModalOpen(true);
  };

  // Task Handlers
  const handleCreateTask = (taskData: Omit<ProjectTask, 'id' | 'createdAt'>) => {
    const newTask: ProjectTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks]
    }));

    addActivity({
      user: 'You',
      action: 'created sprint task:',
      target: newTask.title,
      timestamp: 'Just now',
      type: 'create'
    });
  };

  const handleUpdateTasks = (updatedTasks: ProjectTask[]) => {
    setState((prev) => ({ ...prev, tasks: updatedTasks }));
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find(t => t.id === taskId);
      if (!task) return prev;
      const nextStatus = task.status === 'done' ? 'in_progress' : 'done';
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
      };
    });

    const targetTask = state.tasks.find(t => t.id === taskId);
    if (targetTask) {
      addActivity({
        user: 'You',
        action: targetTask.status === 'done' ? 'reopened task:' : 'completed task:',
        target: targetTask.title,
        timestamp: 'Just now',
        type: 'status'
      });
    }
  };

  // Table Handlers
  const handleUpdateTable = (updatedTable: TableSchema) => {
    setState((prev) => ({
      ...prev,
      tables: prev.tables.map(t => t.id === updatedTable.id ? updatedTable : t)
    }));
  };

  const handleCreateRow = (rowData: Record<string, any>) => {
    const currentTable = state.tables[0];
    if (!currentTable) return;

    const newRow: TableRow = {
      ...rowData,
      id: `row-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedTable = {
      ...currentTable,
      rows: [newRow, ...currentTable.rows]
    };

    handleUpdateTable(updatedTable);

    addActivity({
      user: 'You',
      action: 'added record to table:',
      target: `${currentTable.name} (${newRow.service || newRow.id})`,
      timestamp: 'Just now',
      type: 'create'
    });
  };

  // Docs Handlers
  const handleUpdateDocs = (updatedDocs: DocPage[]) => {
    setState((prev) => ({ ...prev, docs: updatedDocs }));
  };

  const handleCreateDoc = (docData: Omit<DocPage, 'id' | 'updatedAt' | 'wordCount'>) => {
    const wordCount = docData.content.trim().split(/\s+/).length;
    const newDoc: DocPage = {
      ...docData,
      id: `doc-${Date.now()}`,
      wordCount,
      updatedAt: new Date().toISOString()
    };

    setState((prev) => ({
      ...prev,
      docs: [newDoc, ...prev.docs],
      activeModule: 'docs'
    }));
    setSelectedDocId(newDoc.id);

    addActivity({
      user: 'You',
      action: 'drafted technical spec:',
      target: newDoc.title,
      timestamp: 'Just now',
      type: 'create'
    });
  };

  // Automations Handlers
  const handleUpdateAutomations = (updatedAutomations: AutomationRule[]) => {
    setState((prev) => ({ ...prev, automations: updatedAutomations }));
  };

  const currentWorkspace = state.workspaces.find(w => w.id === state.currentWorkspaceId) || state.workspaces[0];
  const currentTable = state.tables[0];

  return (
    <div className={`min-h-screen ${state.theme === 'light' ? 'bg-neutral-100 text-neutral-900' : 'bg-neutral-950 text-neutral-100'}`}>
      {/* Top Bar Contract (3 Zones) */}
      <TopBar
        currentWorkspace={currentWorkspace}
        workspaces={state.workspaces}
        onSelectWorkspace={handleSelectWorkspace}
        activeModule={state.activeModule}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenNewModal={handleOpenNewModal}
        onToggleActivityDrawer={() => setActivityDrawerOpen(prev => !prev)}
        unreadActivitiesCount={state.activities.length}
        theme={state.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Workspace Frame */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          activeModule={state.activeModule}
          onSelectModule={handleSelectModule}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          tasks={state.tasks}
          tables={state.tables}
          docs={state.docs}
          onSelectDoc={handleSelectDoc}
          onResetData={handleResetData}
        />

        {/* Viewport Canvas */}
        <main className="flex-1 p-6 md:p-8 min-w-0 overflow-y-auto">
          {state.activeModule === 'overview' && (
            <OverviewView
              state={state}
              onSelectModule={handleSelectModule}
              onSelectDoc={handleSelectDoc}
              onOpenNewModal={handleOpenNewModal}
              onToggleTaskStatus={handleToggleTaskStatus}
            />
          )}

          {state.activeModule === 'tables' && currentTable && (
            <TableView
              table={currentTable}
              onUpdateTable={handleUpdateTable}
              onOpenNewModal={handleOpenNewModal}
            />
          )}

          {state.activeModule === 'kanban' && (
            <KanbanView
              tasks={state.tasks}
              onUpdateTasks={handleUpdateTasks}
              onOpenNewModal={handleOpenNewModal}
            />
          )}

          {state.activeModule === 'docs' && (
            <DocsView
              docs={state.docs}
              onUpdateDocs={handleUpdateDocs}
              selectedDocId={selectedDocId}
              onOpenNewModal={handleOpenNewModal}
            />
          )}

          {state.activeModule === 'metrics' && currentTable && (
            <MetricsView
              tasks={state.tasks}
              table={currentTable}
            />
          )}

          {state.activeModule === 'automations' && (
            <AutomationsView
              automations={state.automations}
              onUpdateAutomations={handleUpdateAutomations}
              onAddActivity={addActivity}
            />
          )}
        </main>
      </div>

      {/* Global Command Palette (Cmd + K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectModule={handleSelectModule}
        onOpenNewModal={handleOpenNewModal}
        onToggleTheme={handleToggleTheme}
        onResetData={handleResetData}
        onExportJson={handleExportJson}
        tasks={state.tasks}
        docs={state.docs}
        tables={state.tables}
        onSelectDoc={handleSelectDoc}
      />

      {/* Universal New Item Modal */}
      {currentTable && (
        <NewItemModal
          isOpen={newItemModalOpen}
          onClose={() => setNewItemModalOpen(false)}
          defaultType={newItemModalType}
          currentTable={currentTable}
          onCreateTask={handleCreateTask}
          onCreateRow={handleCreateRow}
          onCreateDoc={handleCreateDoc}
        />
      )}

      {/* Real-Time Activity Drawer */}
      <ActivityDrawer
        isOpen={activityDrawerOpen}
        onClose={() => setActivityDrawerOpen(false)}
        activities={state.activities}
        onClearActivities={handleClearActivities}
      />
    </div>
  );
}
