import React, { useState } from 'react';
import { X, CheckSquare, Table as TableIcon, FileText } from 'lucide-react';
import { Priority, TableSchema, Assignee, ProjectTask, DocPage, TableRow } from '../types';
import { TEAM_MEMBERS } from '../sampleData';

interface NewItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'task' | 'row' | 'doc';
  currentTable: TableSchema;
  onCreateTask: (task: Omit<ProjectTask, 'id' | 'createdAt'>) => void;
  onCreateRow: (row: Record<string, any>) => void;
  onCreateDoc: (doc: Omit<DocPage, 'id' | 'updatedAt' | 'wordCount'>) => void;
}

export const NewItemModal: React.FC<NewItemModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'task',
  currentTable,
  onCreateTask,
  onCreateRow,
  onCreateDoc
}) => {
  const [activeTab, setActiveTab] = useState<'task' | 'row' | 'doc'>(defaultType);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');
  const [taskAssignee, setTaskAssignee] = useState<Assignee>(TEAM_MEMBERS[0]);
  const [taskPoints, setTaskPoints] = useState(3);
  const [taskDueDate, setTaskDueDate] = useState('2026-10-10');
  const [taskTags, setTaskTags] = useState('Platform, API');

  // Table Row form state
  const [rowValues, setRowValues] = useState<Record<string, any>>({
    service: '',
    status: 'Active',
    category: 'Core API',
    lead: 'Alex Chen',
    replicas: 4,
    deployedAt: new Date().toISOString().slice(0, 10)
  });

  // Doc form state
  const [docTitle, setDocTitle] = useState('');
  const [docExcerpt, setDocExcerpt] = useState('');
  const [docTags, setDocTags] = useState('RFC, Architecture');
  const [docContent, setDocContent] = useState('');

  if (!isOpen) return null;

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    onCreateTask({
      title: taskTitle.trim(),
      description: taskDesc.trim() || 'No detailed description provided.',
      status: 'in_progress',
      priority: taskPriority,
      assignee: taskAssignee,
      estimatePoints: Number(taskPoints) || 1,
      dueDate: taskDueDate,
      tags: taskTags.split(',').map(t => t.trim()).filter(Boolean)
    });

    onClose();
  };

  const handleRowSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRow(rowValues);
    onClose();
  };

  const handleDocSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    onCreateDoc({
      title: docTitle.trim(),
      icon: 'FileText',
      excerpt: docExcerpt.trim() || 'Workspace engineering specification and notes.',
      content: docContent.trim() || `# ${docTitle}\n\n## Overview\nEnter document contents here...`,
      tags: docTags.split(',').map(t => t.trim()).filter(Boolean),
      favorite: false
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-semibold text-white">Create New Workspace Item</h3>
            <p className="text-xs text-neutral-400">Add a record, sprint task, or engineering document</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-neutral-800/80 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('task')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'task'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sprint Task</span>
          </button>

          <button
            onClick={() => setActiveTab('row')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'row'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Table Record</span>
          </button>

          <button
            onClick={() => setActiveTab('doc')}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'doc'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Document / RFC</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5">
          {activeTab === 'task' && (
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optimize Redis eviction policy for p99 latency"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Specific technical requirements and acceptance criteria..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Assignee</label>
                  <select
                    value={taskAssignee.name}
                    onChange={(e) => {
                      const selected = TEAM_MEMBERS.find(m => m.name === e.target.value);
                      if (selected) setTaskAssignee(selected);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                  >
                    {TEAM_MEMBERS.map(m => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Estimate Points</label>
                  <input
                    type="number"
                    min={1}
                    max={21}
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Infrastructure, Security, Core"
                  value={taskTags}
                  onChange={(e) => setTaskTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          )}

          {activeTab === 'row' && (
            <form onSubmit={handleRowSubmit} className="space-y-4">
              <div className="text-xs text-neutral-400 mb-2">
                Adding record to <span className="font-semibold text-neutral-200">{currentTable.name}</span>
              </div>

              {currentTable.columns.map((col) => (
                <div key={col.id}>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {col.name} {col.type === 'status' && '(Status)'}
                  </label>
                  {col.options ? (
                    <select
                      value={rowValues[col.id] || col.options[0]}
                      onChange={(e) => setRowValues({ ...rowValues, [col.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                    >
                      {col.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : col.type === 'number' ? (
                    <input
                      type="number"
                      value={rowValues[col.id] ?? 0}
                      onChange={(e) => setRowValues({ ...rowValues, [col.id]: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  ) : col.type === 'date' ? (
                    <input
                      type="date"
                      value={rowValues[col.id] || ''}
                      onChange={(e) => setRowValues({ ...rowValues, [col.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={`Enter ${col.name}...`}
                      value={rowValues[col.id] || ''}
                      onChange={(e) => setRowValues({ ...rowValues, [col.id]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                    />
                  )}
                </div>
              ))}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Insert Record
                </button>
              </div>
            </form>
          )}

          {activeTab === 'doc' && (
            <form onSubmit={handleDocSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Tracing RFC v2"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Short Summary / Excerpt</label>
                <input
                  type="text"
                  placeholder="High-level takeaway for the document..."
                  value={docExcerpt}
                  onChange={(e) => setDocExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Tags</label>
                <input
                  type="text"
                  placeholder="RFC, Architecture, Protocol"
                  value={docTags}
                  onChange={(e) => setDocTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Initial Markdown Content</label>
                <textarea
                  rows={4}
                  placeholder="# Technical Spec\n\n## 1. Problem Statement..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 font-mono placeholder-neutral-500 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Create Document
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
