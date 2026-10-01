export type ModuleType = 'overview' | 'tables' | 'kanban' | 'docs' | 'metrics' | 'automations';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Assignee {
  name: string;
  initials: string;
  color: string;
  avatar?: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export type ColumnType = 'text' | 'number' | 'status' | 'select' | 'date';

export interface TableColumn {
  id: string;
  name: string;
  type: ColumnType;
  options?: string[];
  width?: number;
}

export interface TableRow {
  id: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
}

export interface TableSchema {
  id: string;
  name: string;
  description: string;
  columns: TableColumn[];
  rows: TableRow[];
}

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  assignee: Assignee;
  estimatePoints: number;
  dueDate: string;
  tags: string[];
  createdAt: string;
}

export interface DocPage {
  id: string;
  title: string;
  icon: string;
  excerpt: string;
  content: string;
  tags: string[];
  favorite: boolean;
  updatedAt: string;
  wordCount: number;
}

export interface MetricDataPoint {
  label: string;
  primary: number;
  secondary: number;
}

export interface AutomationRule {
  id: string;
  title: string;
  trigger: string;
  action: string;
  active: boolean;
  runCount: number;
  lastTriggered: string;
}

export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  type: 'create' | 'update' | 'status' | 'automation';
}

export interface AppBaseState {
  currentWorkspaceId: string;
  workspaces: Workspace[];
  activeModule: ModuleType;
  tables: TableSchema[];
  tasks: ProjectTask[];
  docs: DocPage[];
  automations: AutomationRule[];
  activities: ActivityItem[];
  theme: 'dark' | 'light';
}
