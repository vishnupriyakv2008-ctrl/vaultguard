import React, { useState, useMemo } from 'react';
import { 
  Table as TableIcon, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Upload, 
  Trash2, 
  Copy, 
  MoreHorizontal, 
  X, 
  Check, 
  Edit2, 
  List, 
  LayoutGrid, 
  Columns,
  ChevronDown
} from 'lucide-react';
import { TableSchema, TableColumn, TableRow, ColumnType } from '../../types';

interface TableViewProps {
  table: TableSchema;
  onUpdateTable: (updatedTable: TableSchema) => void;
  onOpenNewModal: (type?: 'task' | 'row' | 'doc') => void;
}

export const TableView: React.FC<TableViewProps> = ({
  table,
  onUpdateTable,
  onOpenNewModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  
  // Add column modal state
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<ColumnType>('text');
  const [newColOptions, setNewColOptions] = useState('');

  // Row selection for batch actions
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Filter & Sort rows
  const filteredRows = useMemo(() => {
    let result = [...table.rows];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(q)
        )
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(row => row.status === statusFilter);
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortDirection === 'asc' 
          ? strA.localeCompare(strB) 
          : strB.localeCompare(strA);
      });
    }

    return result;
  }, [table.rows, searchQuery, statusFilter, sortColumn, sortDirection]);

  // Handle sort click
  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(colId);
      setSortDirection('asc');
    }
  };

  // Inline Cell Editing
  const startEditingCell = (row: TableRow, colId: string) => {
    setEditingCell({ rowId: row.id, colId });
    setEditValue(row[colId] ?? '');
  };

  const saveCellEdit = () => {
    if (!editingCell) return;
    const { rowId, colId } = editingCell;

    const updatedRows = table.rows.map(r => {
      if (r.id === rowId) {
        return {
          ...r,
          [colId]: editValue,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });

    onUpdateTable({
      ...table,
      rows: updatedRows
    });

    setEditingCell(null);
  };

  // Add Column
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    const colId = newColName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const newColumn: TableColumn = {
      id: colId,
      name: newColName.trim(),
      type: newColType,
      options: newColOptions ? newColOptions.split(',').map(s => s.trim()) : undefined,
      width: 150
    };

    onUpdateTable({
      ...table,
      columns: [...table.columns, newColumn]
    });

    setShowAddColumnModal(false);
    setNewColName('');
    setNewColOptions('');
  };

  // Delete Row
  const handleDeleteRow = (rowId: string) => {
    onUpdateTable({
      ...table,
      rows: table.rows.filter(r => r.id !== rowId)
    });
    if (selectedRowId === rowId) setSelectedRowId(null);
  };

  // Duplicate Row
  const handleDuplicateRow = (row: TableRow) => {
    const duplicated: TableRow = {
      ...row,
      id: `row-${Date.now()}`,
      service: row.service ? `${row.service}-copy` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onUpdateTable({
      ...table,
      rows: [...table.rows, duplicated]
    });
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = table.columns.map(c => `"${c.name}"`).join(',');
    const rows = table.rows.map(row => 
      table.columns.map(c => `"${row[c.id] ?? ''}"`).join(',')
    ).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + `${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${table.name.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import CSV handler
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;

      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, '').trim());

      const newRows: TableRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const rowObj: Record<string, any> = {
          id: `row-imported-${Date.now()}-${i}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        headers.forEach((h, idx) => {
          const col = table.columns.find(c => c.name.toLowerCase() === h.toLowerCase());
          const key = col ? col.id : h.toLowerCase().replace(/[^a-z0-9]/g, '_');
          rowObj[key] = values[idx] ?? '';
        });

        newRows.push(rowObj as TableRow);
      }

      onUpdateTable({
        ...table,
        rows: [...table.rows, ...newRows]
      });
    };
    reader.readAsText(file);
  };

  const selectedRowData = table.rows.find(r => r.id === selectedRowId);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Table Header & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">{table.name}</h1>
            <span className="font-mono text-xs text-neutral-400 tabular-nums">
              ({filteredRows.length} records)
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">{table.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-neutral-400" />
            <span>Import CSV</span>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleImportCSV} 
              className="hidden" 
            />
          </label>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddColumnModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
          >
            <Columns className="w-3.5 h-3.5 text-neutral-400" />
            <span>Add Column</span>
          </button>

          <button
            onClick={() => onOpenNewModal('row')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[220px]">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Filter records by any field..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-neutral-800 text-white font-medium shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('Active')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === 'Active'
                ? 'bg-neutral-800 text-emerald-400 font-medium shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setStatusFilter('Degraded')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === 'Degraded'
                ? 'bg-neutral-800 text-rose-400 font-medium shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Degraded
          </button>
          <button
            onClick={() => setStatusFilter('Staged')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              statusFilter === 'Staged'
                ? 'bg-neutral-800 text-amber-400 font-medium shadow-xs'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Staged
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400">
                <th className="py-3 px-4 w-10 text-center font-normal">#</th>
                {table.columns.map((col) => (
                  <th 
                    key={col.id}
                    onClick={() => handleSort(col.id)}
                    className="py-3 px-4 font-semibold text-neutral-300 select-none cursor-pointer hover:text-white transition-colors"
                    style={{ minWidth: col.width || 140 }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.name}</span>
                      <ArrowUpDown className={`w-3 h-3 ${sortColumn === col.id ? 'text-indigo-400' : 'text-neutral-600'}`} />
                    </div>
                  </th>
                ))}
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={table.columns.length + 2} className="py-12 text-center text-neutral-500">
                    No rows match your active search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr 
                    key={row.id}
                    className="hover:bg-neutral-800/40 transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center font-mono text-[11px] text-neutral-600">
                      {index + 1}
                    </td>

                    {table.columns.map((col) => {
                      const isEditing = editingCell?.rowId === row.id && editingCell?.colId === col.id;
                      const value = row[col.id];

                      return (
                        <td 
                          key={col.id} 
                          onDoubleClick={() => startEditingCell(row, col.id)}
                          className="py-2 px-4 text-neutral-200"
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              {col.options ? (
                                <select
                                  autoFocus
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={saveCellEdit}
                                  className="w-full bg-neutral-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none"
                                >
                                  {col.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  autoFocus
                                  type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                  value={editValue}
                                  onChange={(e) => setEditValue(col.type === 'number' ? Number(e.target.value) : e.target.value)}
                                  onBlur={saveCellEdit}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') saveCellEdit();
                                    if (e.key === 'Escape') setEditingCell(null);
                                  }}
                                  className="w-full bg-neutral-950 border border-indigo-500 rounded px-2 py-1 text-xs text-white outline-none"
                                />
                              )}
                              <button
                                onClick={saveCellEdit}
                                className="p-1 rounded bg-indigo-600 text-white"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </div>
                          ) : col.type === 'status' ? (
                            <span className={`font-medium ${
                              value === 'Active' ? 'text-emerald-400' :
                              value === 'Degraded' ? 'text-rose-400' :
                              value === 'Staged' ? 'text-amber-400' :
                              'text-neutral-400'
                            }`}>
                              {value}
                            </span>
                          ) : col.type === 'number' ? (
                            <span className="font-mono tabular-nums text-neutral-300">
                              {value}
                            </span>
                          ) : col.type === 'date' ? (
                            <span className="font-mono tabular-nums text-neutral-400">
                              {value}
                            </span>
                          ) : (
                            <span className="truncate block">{value || '—'}</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions column */}
                    <td className="py-2 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedRowId(row.id)}
                          title="Inspect row details"
                          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateRow(row)}
                          title="Duplicate record"
                          className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          title="Delete record"
                          className="p-1 rounded text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table status footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/40 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Tip: Double click any cell to edit directly inline</span>
          <span className="font-mono tabular-nums">{table.rows.length} total rows stored</span>
        </div>
      </div>

      {/* Row Detail Inspector Slide-over Drawer */}
      {selectedRowData && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedRowId(null)} />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-neutral-900 border-l border-neutral-800 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-150">
              <div className="space-y-6 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Record Inspector</h2>
                    <span className="font-mono text-xs text-neutral-500">{selectedRowData.id}</span>
                  </div>
                  <button
                    onClick={() => setSelectedRowId(null)}
                    className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {table.columns.map((col) => (
                    <div key={col.id}>
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        {col.name} ({col.type})
                      </label>
                      <input
                        type="text"
                        value={selectedRowData[col.id] ?? ''}
                        onChange={(e) => {
                          const updatedRows = table.rows.map(r => 
                            r.id === selectedRowData.id 
                              ? { ...r, [col.id]: e.target.value, updatedAt: new Date().toISOString() } 
                              : r
                          );
                          onUpdateTable({ ...table, rows: updatedRows });
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  ))}

                  <div className="pt-4 border-t border-neutral-800 space-y-1 text-xs text-neutral-500 font-mono">
                    <div>Created: {selectedRowData.createdAt}</div>
                    <div>Updated: {selectedRowData.updatedAt}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedRowId(null)}
                  className="px-4 py-2 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddColumnModal(false)} />
          <div className="relative w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl p-5 z-10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">Add Custom Column</h3>
              <button onClick={() => setShowAddColumnModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddColumn} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Column Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Memory Limit (MB)"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">Column Type</label>
                <select
                  value={newColType}
                  onChange={(e) => setNewColType(e.target.value as ColumnType)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="status">Status</option>
                  <option value="select">Dropdown Select</option>
                  <option value="date">Date</option>
                </select>
              </div>

              {newColType === 'select' && (
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">Options (comma separated)</label>
                  <input
                    type="text"
                    placeholder="Option 1, Option 2, Option 3"
                    value={newColOptions}
                    onChange={(e) => setNewColOptions(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddColumnModal(false)}
                  className="px-3 py-1.5 text-xs text-neutral-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Add Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
