import { AppBaseState, Assignee } from './types';

export const TEAM_MEMBERS: Assignee[] = [
  { name: 'Alex Chen', initials: 'AC', color: 'bg-indigo-600' },
  { name: 'Sarah Miller', initials: 'SM', color: 'bg-emerald-600' },
  { name: 'David Ross', initials: 'DR', color: 'bg-amber-600' },
  { name: 'Elena Vance', initials: 'EV', color: 'bg-rose-600' },
  { name: 'Marcus Brody', initials: 'MB', color: 'bg-cyan-600' }
];

export const INITIAL_STATE: AppBaseState = {
  currentWorkspaceId: 'ws-1',
  workspaces: [
    {
      id: 'ws-1',
      name: 'Apex Platform Core',
      icon: 'Layers',
      color: 'indigo',
      description: 'Distributed microservices, core APIs, and platform telemetry.'
    },
    {
      id: 'ws-2',
      name: 'Product Design Sprint',
      icon: 'Palette',
      color: 'emerald',
      description: 'Design system components, mobile layout specs, and user journeys.'
    },
    {
      id: 'ws-3',
      name: 'Cloud Infrastructure',
      icon: 'Cloud',
      color: 'cyan',
      description: 'Kubernetes orchestration, VPC networking, and disaster recovery.'
    }
  ],
  activeModule: 'overview',
  theme: 'dark',
  tables: [
    {
      id: 'tbl-1',
      name: 'Production Deployments & Services',
      description: 'Directory of platform services, health statuses, and deployment schedules.',
      columns: [
        { id: 'service', name: 'Service Name', type: 'text', width: 220 },
        { id: 'status', name: 'Status', type: 'status', options: ['Active', 'Degraded', 'Maintenance', 'Staged'], width: 140 },
        { id: 'category', name: 'Domain', type: 'select', options: ['Core API', 'Storage', 'Worker Queue', 'Auth', 'Edge Gateway'], width: 150 },
        { id: 'lead', name: 'Owner', type: 'text', width: 140 },
        { id: 'replicas', name: 'Replicas', type: 'number', width: 100 },
        { id: 'deployedAt', name: 'Last Deploy', type: 'date', width: 130 }
      ],
      rows: [
        {
          id: 'row-1',
          service: 'auth-gateway-edge',
          status: 'Active',
          category: 'Auth',
          lead: 'Alex Chen',
          replicas: 16,
          deployedAt: '2026-09-28',
          createdAt: '2026-09-01T10:00:00Z',
          updatedAt: '2026-09-28T14:22:00Z'
        },
        {
          id: 'row-2',
          service: 'event-broker-cluster',
          status: 'Active',
          category: 'Worker Queue',
          lead: 'David Ross',
          replicas: 24,
          deployedAt: '2026-09-29',
          createdAt: '2026-09-02T11:15:00Z',
          updatedAt: '2026-09-29T18:40:00Z'
        },
        {
          id: 'row-3',
          service: 'analytics-aggregator-v2',
          status: 'Staged',
          category: 'Core API',
          lead: 'Sarah Miller',
          replicas: 8,
          deployedAt: '2026-09-30',
          createdAt: '2026-09-05T09:30:00Z',
          updatedAt: '2026-09-30T11:10:00Z'
        },
        {
          id: 'row-4',
          service: 'blob-storage-sync',
          status: 'Degraded',
          category: 'Storage',
          lead: 'Elena Vance',
          replicas: 12,
          deployedAt: '2026-09-25',
          createdAt: '2026-09-08T16:00:00Z',
          updatedAt: '2026-09-27T08:50:00Z'
        },
        {
          id: 'row-5',
          service: 'edge-caching-proxy',
          status: 'Active',
          category: 'Edge Gateway',
          lead: 'Marcus Brody',
          replicas: 32,
          deployedAt: '2026-10-01',
          createdAt: '2026-09-12T14:00:00Z',
          updatedAt: '2026-10-01T04:12:00Z'
        },
        {
          id: 'row-6',
          service: 'webhook-relay-daemon',
          status: 'Active',
          category: 'Worker Queue',
          lead: 'David Ross',
          replicas: 6,
          deployedAt: '2026-09-22',
          createdAt: '2026-09-15T08:20:00Z',
          updatedAt: '2026-09-22T19:00:00Z'
        }
      ]
    }
  ],
  tasks: [
    {
      id: 'tsk-101',
      title: 'Upgrade rate limiter to token-bucket Redis cluster',
      description: 'Transition from single in-memory instance to distributed Redis sentinel with automated failover.',
      status: 'in_progress',
      priority: 'high',
      assignee: TEAM_MEMBERS[0],
      estimatePoints: 5,
      dueDate: '2026-10-05',
      tags: ['Infrastructure', 'Performance'],
      createdAt: '2026-09-27'
    },
    {
      id: 'tsk-102',
      title: 'Implement database read-replica connection pooler',
      description: 'Optimize p99 query latency during heavy ingestion cycles using PgBouncer pooling.',
      status: 'in_progress',
      priority: 'urgent',
      assignee: TEAM_MEMBERS[1],
      estimatePoints: 8,
      dueDate: '2026-10-03',
      tags: ['Database', 'Postgres'],
      createdAt: '2026-09-28'
    },
    {
      id: 'tsk-103',
      title: 'Audit zero-trust service mesh mutual TLS certificates',
      description: 'Verify 90-day rotation compliance and automated cert-manager renewals across staging pods.',
      status: 'review',
      priority: 'medium',
      assignee: TEAM_MEMBERS[2],
      estimatePoints: 3,
      dueDate: '2026-10-02',
      tags: ['Security', 'mTLS'],
      createdAt: '2026-09-25'
    },
    {
      id: 'tsk-104',
      title: 'Export OpenAPI v3.1 specification for partner API',
      description: 'Generate static schema documentation and validate response shapes against mock contract tests.',
      status: 'done',
      priority: 'medium',
      assignee: TEAM_MEMBERS[3],
      estimatePoints: 2,
      dueDate: '2026-09-30',
      tags: ['Docs', 'API'],
      createdAt: '2026-09-20'
    },
    {
      id: 'tsk-105',
      title: 'Implement distributed tracing baggage propagation',
      description: 'Standardize traceparent HTTP header across all asynchronous webhook subscribers.',
      status: 'backlog',
      priority: 'low',
      assignee: TEAM_MEMBERS[4],
      estimatePoints: 3,
      dueDate: '2026-10-14',
      tags: ['Observability'],
      createdAt: '2026-09-29'
    },
    {
      id: 'tsk-106',
      title: 'Mitigate memory leak in websocket message deserializer',
      description: 'Fix circular buffer retain cycle occurring when client disconnects during active broadcast.',
      status: 'review',
      priority: 'urgent',
      assignee: TEAM_MEMBERS[0],
      estimatePoints: 5,
      dueDate: '2026-10-02',
      tags: ['Bugfix', 'WebSockets'],
      createdAt: '2026-09-30'
    },
    {
      id: 'tsk-107',
      title: 'Define multi-region disaster recovery runbook',
      description: 'Document step-by-step cold-standby activation in us-east-2 region with RTO <= 15 minutes.',
      status: 'backlog',
      priority: 'medium',
      assignee: TEAM_MEMBERS[2],
      estimatePoints: 5,
      dueDate: '2026-10-20',
      tags: ['Operations', 'SLA'],
      createdAt: '2026-09-26'
    },
    {
      id: 'tsk-108',
      title: 'Refactor tenant quota enforcement middleware',
      description: 'Migrate hardcoded tier thresholds into dynamic tenant policy configuration store.',
      status: 'done',
      priority: 'high',
      assignee: TEAM_MEMBERS[1],
      estimatePoints: 5,
      dueDate: '2026-09-29',
      tags: ['Billing', 'Architecture'],
      createdAt: '2026-09-18'
    }
  ],
  docs: [
    {
      id: 'doc-1',
      title: 'Platform Architecture RFC: Distributed Event Bus',
      icon: 'Cpu',
      excerpt: 'Technical specification for moving asynchronous ingest pipelines to partitioned Kafka event logs with transactional outbox semantics.',
      content: `# Platform Architecture RFC: Distributed Event Bus

## 1. Context & Objective
As throughput scales beyond 45,000 events/second, the legacy point-to-point webhook relay introduces cascading delays when downstream microservices experience cold-starts.

This proposal establishes a unified **Distributed Event Bus** built upon partitioned logs and a strict transactional outbox pattern.

## 2. Core Architectural Pillars
- **Idempotency**: All consumers enforce monotonic event deduplication via 24-hour Bloom filters.
- **Ordered Partitions**: Events keyed by tenant ID guarantee strict FIFO processing per customer.
- **Backpressure Protocol**: Reactive stream flow control prevents subscriber exhaustion.

\`\`\`typescript
interface PlatformEvent<T = unknown> {
  id: string;
  source: string;
  type: 'entity.created' | 'entity.updated' | 'metric.threshold';
  tenantId: string;
  timestamp: string; // ISO 8601
  payload: T;
}
\`\`\`

## 3. SLA Targets
- End-to-end ingestion latency: **p95 < 42ms**
- Durability guarantee: **3x replication across availability zones**
- Replay window: **7 calendar days**`,
      tags: ['RFC', 'Architecture', 'Kafka'],
      favorite: true,
      updatedAt: '2026-09-30T17:15:00Z',
      wordCount: 168
    },
    {
      id: 'doc-2',
      title: 'Engineering Sprint Guidelines & Definition of Done',
      icon: 'CheckSquare',
      excerpt: 'Standard operational protocol for pull requests, automated integration test coverage, and staged Canary deployments.',
      content: `# Engineering Sprint Guidelines

## Definition of Done (DoD)
Every pull request merged to the main trunk must fulfill the following verification checklist before deployment to staging:

1. **Automated Unit & Integration Tests**: Line coverage minimum 85% for business logic layers.
2. **Zero Regressions**: All end-to-end synthetic flows pass without flakiness.
3. **OpenAPI Schema Sync**: Any change to API endpoints must update corresponding OpenAPI definitions.
4. **Telemetry Markers**: New endpoints must emit standard Prometheus metrics: \`http_requests_total\`, \`http_request_duration_seconds\`.
5. **Security Scan**: Static analysis (SAST) reports zero high or critical CVE vulnerabilities.

## Release Cadence
- Daily Canary deployments at 14:00 UTC with 5% traffic routing for 60 minutes.
- Automated rollback initiates if 5xx error rate exceeds 0.05% or p99 latency spikes above 250ms.`,
      tags: ['Process', 'Standards', 'CI/CD'],
      favorite: true,
      updatedAt: '2026-09-28T09:40:00Z',
      wordCount: 135
    },
    {
      id: 'doc-3',
      title: 'Database Sharding & Data Migration Protocol',
      icon: 'Database',
      excerpt: 'Operational guide for splitting large tenant partitions and executing zero-downtime schema migrations.',
      content: `# Database Sharding Protocol

## Overview
This runbook covers online schema modifications and tenant partition isolation using foreign data wrappers and logical replication.

### Pre-Flight Invariants
- Verify free disk volume $\ge$ 40% on primary cluster.
- Ensure replication lag is below 2.5 seconds on all read replicas.
- Schedule migrations during off-peak window (02:00–04:00 UTC).

### Execution Phases
1. **Shadow Column Creation**: Add nullable target column.
2. **Dual-Writing**: Application code writes to both old and new columns.
3. **Backfill**: Asynchronous worker batches migrate historical rows in chunks of 5,000.
4. **Validation & Switchover**: Verify checksum parity before dropping legacy columns.`,
      tags: ['Database', 'Runbook'],
      favorite: false,
      updatedAt: '2026-09-22T11:00:00Z',
      wordCount: 110
    }
  ],
  automations: [
    {
      id: 'auto-1',
      title: 'Auto-Record Service Deployment to Audit Log',
      trigger: 'When a service row status changes to "Active"',
      action: 'Create audit log entry and dispatch slack notification to #ops-leads',
      active: true,
      runCount: 42,
      lastTriggered: '2026-10-01 04:12 UTC'
    },
    {
      id: 'auto-2',
      title: 'Urgent Priority Task Escalation',
      trigger: 'When task priority is set to "Urgent"',
      action: 'Assign sprint lead and set target due date within 48 hours',
      active: true,
      runCount: 18,
      lastTriggered: '2026-09-30 14:05 UTC'
    },
    {
      id: 'auto-3',
      title: 'Daily Sprint Velocity Snapshot',
      trigger: 'Every midnight UTC',
      action: 'Calculate completed story points and append to weekly velocity chart',
      active: true,
      runCount: 94,
      lastTriggered: '2026-10-01 00:00 UTC'
    },
    {
      id: 'auto-4',
      title: 'Stale Draft Document Archival',
      trigger: 'Document unmodified for > 45 days',
      action: 'Tag as [Archived] and remove from workspace favorites',
      active: false,
      runCount: 7,
      lastTriggered: '2026-09-15 12:30 UTC'
    }
  ],
  activities: [
    {
      id: 'act-1',
      user: 'Marcus Brody',
      action: 'deployed new release for',
      target: 'edge-caching-proxy',
      timestamp: '2 hours ago',
      type: 'status'
    },
    {
      id: 'act-2',
      user: 'David Ross',
      action: 'moved task to In Review:',
      target: 'Audit zero-trust service mesh mutual TLS certificates',
      timestamp: '4 hours ago',
      type: 'update'
    },
    {
      id: 'act-3',
      user: 'Sarah Miller',
      action: 'published document revision:',
      target: 'Platform Architecture RFC: Distributed Event Bus',
      timestamp: 'Yesterday at 17:15',
      type: 'create'
    },
    {
      id: 'act-4',
      user: 'Automation Daemon',
      action: 'executed rule',
      target: 'Daily Sprint Velocity Snapshot (13 story points registered)',
      timestamp: 'Yesterday at 00:00',
      type: 'automation'
    },
    {
      id: 'act-5',
      user: 'Alex Chen',
      action: 'created high-priority sprint task:',
      target: 'Upgrade rate limiter to token-bucket Redis cluster',
      timestamp: '2 days ago',
      type: 'create'
    }
  ]
};
