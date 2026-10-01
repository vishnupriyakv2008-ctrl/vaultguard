import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  CheckSquare, 
  Calendar, 
  Tag, 
  Clock, 
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';
import { ProjectTask, TaskStatus, Priority, Assignee } from '../../types';
import { TEAM_MEMBERS } from '../../sampleData';

interface KanbanViewProps {
  tasks: ProjectTask[];
  onUpdateTasks: (updatedTasks: ProjectTask[]) => void;
  onOpenNewModal: (type?: 'task' | 'row' | 'doc') => void;
}

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  onUpdateTasks,
  onOpenNewModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: 'backlog', label: 'Backlog Queue', color: 'border-neutral-700' },
    { id: 'in_progress', label: 'In Progress', color: 'border-indigo-500' },
    { id: 'review', label: 'Peer Review', color: 'border-amber-500' },
    { id: 'done', label: 'Completed', color: 'border-emerald-500' }
  ];

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = searchQuery.trim() === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignee.name === assigneeFilter;

      return matchesSearch && matchesPriority && matchesAssignee;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter]);

  // Move task to next or previous stage
  const moveTask = (taskId: string, direction: 'prev' | 'next') => {
    const statusOrder: TaskStatus[] = ['backlog', 'in_progress', 'review', 'done'];
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        const currentIndex = statusOrder.indexOf(task.status);
        const nextIndex = direction === 'next' 
          ? Math.min(currentIndex + 1, statusOrder.length - 1)
          : Math.max(currentIndex - 1, 0);
        return { ...task, status: statusOrder[nextIndex] };
      }
      return task;
    });

    onUpdateTasks(updated);
  };

  // Change task status directly
  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    onUpdateTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  // Delete task
  const deleteTask = (taskId: string) => {
    onUpdateTasks(tasks.filter(t => t.id !== taskId));
    if (selectedTask?.id === taskId) setSelectedTask(null);
  };

  // Calculate points per column
  const getColumnPoints = (status: TaskStatus) => {
    return filteredTasks
      .filter(t => t.status === status)
      .reduce((sum, t) => sum + (t.estimatePoints || 0), 0);
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">Sprint Board</h1>
            <span className="font-mono text-xs text-neutral-400 tabular-nums">
              ({tasks.length} total tasks · {tasks.reduce((sum, t) => sum + t.estimatePoints, 0)} story points)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">Kanban execution queue with capacity allocation</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onOpenNewModal('task')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            placeholder="Filter tasks by title, tag, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <span>Owner:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="all">All Members</option>
              {TEAM_MEMBERS.map(m => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 min-h-0 overflow-y-auto pb-4">
        {columns.map(col => {
          const columnTasks = filteredTasks.filter(t => t.status === col.id);
          const colPoints = getColumnPoints(col.id);

          return (
            <div 
              key={col.id}
              className="rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col min-h-[300px]"
            >
              {/* Column Header */}
              <div className="p-3 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/40">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    col.id === 'done' ? 'bg-emerald-400' :
                    col.id === 'in_progress' ? 'bg-indigo-400' :
                    col.id === 'review' ? 'bg-amber-400' : 'bg-neutral-500'
                  }`} />
                  <span className="text-xs font-semibold text-neutral-200">{col.label}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums text-neutral-400">
                  <span>{columnTasks.length}</span>
                  <span aria-hidden="true" className="text-neutral-600">·</span>
                  <span>{colPoints} pts</span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                {columnTasks.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    No items in this stage.
                  </div>
                ) : (
                  columnTasks.map(task => (
                    <div
                      key={task.id}
                      className="p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2.5 group cursor-pointer"
                      onClick={() => setSelectedTask(task)}
                    >
                      {/* Priority and Actions Bar */}
                      <div className="flex items-center justify-between text-xs">
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                          task.priority === 'urgent' ? 'text-rose-400' :
                          task.priority === 'high' ? 'text-amber-400' :
                          task.priority === 'medium' ? 'text-indigo-400' :
                          'text-neutral-400'
                        }`}>
                          {task.priority}
                        </span>

                        {/* Move stage controls */}
                        <div 
                          className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {col.id !== 'backlog' && (
                            <button
                              onClick={() => moveTask(task.id, 'prev')}
                              title="Move to previous stage"
                              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {col.id !== 'done' && (
                            <button
                              onClick={() => moveTask(task.id, 'next')}
                              title="Move to next stage"
                              className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTask(task.id)}
                            title="Delete task"
                            className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-neutral-100 leading-snug group-hover:text-indigo-300 transition-colors">
                        {task.title}
                      </h4>

                      {/* Description preview */}
                      <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Tags */}
                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[10px] text-neutral-400">
                          {task.tags.map(t => (
                            <span key={t}>#{t}</span>
                          ))}
                        </div>
                      )}

                      {/* Footer: Assignee & Story Points & Due date */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded-full ${task.assignee.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                            {task.assignee.initials}
                          </div>
                          <span className="text-[11px] text-neutral-300 truncate max-w-[80px]">
                            {task.assignee.name.split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono tabular-nums">
                          <span>{task.dueDate}</span>
                          <span className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-semibold">
                            {task.estimatePoints} pt
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTask(null)} />
          <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-6 z-10 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[11px] text-indigo-400">{selectedTask.id}</span>
                <h3 className="text-sm font-semibold text-white mt-1">{selectedTask.title}</h3>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block mb-1">Description</span>
                <p className="text-neutral-200 leading-relaxed bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block mb-1">Stage Status</span>
                  <select
                    value={selectedTask.status}
                    onChange={(e) => {
                      updateTaskStatus(selectedTask.id, e.target.value as TaskStatus);
                      setSelectedTask({ ...selectedTask, status: e.target.value as TaskStatus });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                  >
                    <option value="backlog">Backlog</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Peer Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <span className="text-neutral-400 block mb-1">Priority</span>
                  <select
                    value={selectedTask.priority}
                    onChange={(e) => {
                      const updated = tasks.map(t => t.id === selectedTask.id ? { ...t, priority: e.target.value as Priority } : t);
                      onUpdateTasks(updated);
                      setSelectedTask({ ...selectedTask, priority: e.target.value as Priority });
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block mb-1">Assignee</span>
                  <div className="flex items-center gap-2 p-2 bg-neutral-950 rounded-lg border border-neutral-800">
                    <div className={`w-5 h-5 rounded-full ${selectedTask.assignee.color} flex items-center justify-center text-white text-[10px] font-bold`}>
                      {selectedTask.assignee.initials}
                    </div>
                    <span className="text-neutral-200">{selectedTask.assignee.name}</span>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-400 block mb-1">Target Due Date</span>
                  <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 font-mono text-neutral-300">
                    {selectedTask.dueDate}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
              <button
                onClick={() => deleteTask(selectedTask.id)}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Task</span>
              </button>

              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
