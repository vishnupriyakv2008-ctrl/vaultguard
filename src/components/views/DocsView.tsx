import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Star, 
  Edit3, 
  Eye, 
  Copy, 
  Download, 
  Trash2, 
  Check, 
  Clock, 
  Hash, 
  Code, 
  Bold, 
  List as ListIcon
} from 'lucide-react';
import { DocPage } from '../../types';

interface DocsViewProps {
  docs: DocPage[];
  onUpdateDocs: (updatedDocs: DocPage[]) => void;
  selectedDocId?: string;
  onOpenNewModal: (type?: 'task' | 'row' | 'doc') => void;
}

export const DocsView: React.FC<DocsViewProps> = ({
  docs,
  onUpdateDocs,
  selectedDocId,
  onOpenNewModal
}) => {
  const [activeDocId, setActiveDocId] = useState<string>(selectedDocId || docs[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];

  const filteredDocs = docs.filter(d => 
    searchQuery.trim() === '' ||
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleUpdateActiveDoc = (fields: Partial<DocPage>) => {
    if (!activeDoc) return;
    const content = fields.content !== undefined ? fields.content : activeDoc.content;
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

    const updated = docs.map(d => {
      if (d.id === activeDoc.id) {
        return {
          ...d,
          ...fields,
          wordCount,
          updatedAt: new Date().toISOString()
        };
      }
      return d;
    });

    onUpdateDocs(updated);
  };

  const toggleFavorite = (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateDocs(docs.map(d => d.id === docId ? { ...d, favorite: !d.favorite } : d));
  };

  const deleteDoc = (docId: string) => {
    const updated = docs.filter(d => d.id !== docId);
    onUpdateDocs(updated);
    if (activeDocId === docId && updated.length > 0) {
      setActiveDocId(updated[0].id);
    }
  };

  const copyToClipboard = () => {
    if (!activeDoc) return;
    navigator.clipboard.writeText(activeDoc.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportMarkdown = () => {
    if (!activeDoc) return;
    const blob = new Blob([activeDoc.content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDoc.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const insertSnippet = (snippet: string) => {
    if (!activeDoc) return;
    handleUpdateActiveDoc({
      content: activeDoc.content + '\n' + snippet
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-7rem)] flex flex-col md:flex-row gap-4 overflow-hidden">
      {/* Left Sidebar: Document List */}
      <div className="w-full md:w-72 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col shrink-0 overflow-hidden">
        {/* Search & New Page */}
        <div className="p-3 border-b border-neutral-800 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Documents ({docs.length})
            </h2>
            <button
              onClick={() => onOpenNewModal('doc')}
              className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>New</span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* List of Docs */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredDocs.map(doc => {
            const isActive = doc.id === activeDoc?.id;

            return (
              <button
                key={doc.id}
                onClick={() => {
                  setActiveDocId(doc.id);
                  setIsEditing(false);
                }}
                className={`w-full text-left p-2.5 rounded-lg transition-colors group relative space-y-1 ${
                  isActive
                    ? 'bg-neutral-800 text-white font-medium shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate text-xs font-medium">
                    <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                    <span className="truncate">{doc.title}</span>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(doc.id, e)}
                    className="p-1 rounded text-neutral-500 hover:text-amber-400 transition-colors shrink-0"
                  >
                    <Star className={`w-3 h-3 ${doc.favorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                  <span className="font-mono tabular-nums">{doc.wordCount} words</span>
                  <span aria-hidden="true">·</span>
                  <span>{doc.tags[0] || 'Doc'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Document Viewer / Editor */}
      {activeDoc ? (
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col overflow-hidden">
          {/* Document Header Controls */}
          <div className="p-4 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-950/40">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                value={activeDoc.title}
                onChange={(e) => handleUpdateActiveDoc({ title: e.target.value })}
                className="w-full bg-transparent text-base font-bold text-white outline-none border-b border-transparent focus:border-neutral-700"
              />
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                <span>Updated {new Date(activeDoc.updatedAt).toLocaleDateString()}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{activeDoc.wordCount} words</span>
                <span aria-hidden="true">·</span>
                <span>~{Math.max(1, Math.ceil(activeDoc.wordCount / 180))} min read</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle Preview / Edit */}
              <div className="flex items-center p-0.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs">
                <button
                  onClick={() => setIsEditing(false)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                    !isEditing ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                    isEditing ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Markdown</span>
                </button>
              </div>

              {/* Action buttons */}
              <button
                onClick={copyToClipboard}
                title="Copy Markdown to Clipboard"
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={exportMarkdown}
                title="Export .md file"
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => deleteDoc(activeDoc.id)}
                title="Delete document"
                className="p-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-rose-400 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick format snippet bar (in edit mode) */}
          {isEditing && (
            <div className="px-4 py-2 border-b border-neutral-800/80 bg-neutral-950/60 flex items-center gap-2 text-xs text-neutral-400">
              <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">Snippets:</span>
              <button
                onClick={() => insertSnippet('## New Section Header')}
                className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px]"
              >
                Heading
              </button>
              <button
                onClick={() => insertSnippet('- [ ] Acceptance verification item')}
                className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px]"
              >
                Task List
              </button>
              <button
                onClick={() => insertSnippet('```typescript\nconst metric = 42;\n```')}
                className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px]"
              >
                Code Block
              </button>
              <button
                onClick={() => insertSnippet('> Important architecture constraint note.')}
                className="px-2 py-0.5 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px]"
              >
                Callout
              </button>
            </div>
          )}

          {/* Document Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {isEditing ? (
              <textarea
                value={activeDoc.content}
                onChange={(e) => handleUpdateActiveDoc({ content: e.target.value })}
                placeholder="Write your document content using standard Markdown..."
                className="w-full h-full bg-transparent text-sm text-neutral-100 font-mono leading-relaxed placeholder-neutral-600 outline-none resize-none"
              />
            ) : (
              <div className="prose prose-invert prose-neutral max-w-none space-y-4 text-xs md:text-sm text-neutral-300 leading-relaxed font-sans">
                {activeDoc.content.split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={idx} className="text-xl md:text-2xl font-bold text-white tracking-tight pt-2">{paragraph.replace('# ', '')}</h1>;
                  }
                  if (paragraph.startsWith('## ')) {
                    return <h2 key={idx} className="text-lg font-semibold text-neutral-100 tracking-tight pt-3 border-b border-neutral-800 pb-1">{paragraph.replace('## ', '')}</h2>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-sm font-semibold text-neutral-200 tracking-tight pt-2">{paragraph.replace('### ', '')}</h3>;
                  }
                  if (paragraph.startsWith('```')) {
                    const cleanCode = paragraph.replace(/```[a-z]*\n|```/g, '');
                    return (
                      <pre key={idx} className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                        <code>{cleanCode}</code>
                      </pre>
                    );
                  }
                  if (paragraph.startsWith('- ') || paragraph.startsWith('1. ')) {
                    const items = paragraph.split('\n');
                    return (
                      <ul key={idx} className="space-y-1 list-disc list-inside text-neutral-300">
                        {items.map((it, itemIdx) => (
                          <li key={itemIdx} className="leading-relaxed">
                            {it.replace(/^[-*]|\d+\.\s*/, '')}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx} className="leading-relaxed text-neutral-300">{paragraph}</p>;
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center p-8 text-center text-neutral-500 text-xs">
          Select or create a document to start reading and editing.
        </div>
      )}
    </div>
  );
};
