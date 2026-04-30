'use client';

import React, { useCallback, useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Node, Edge } from '@xyflow/react';
import { useToast } from '@/components/ui/ToastProvider';

// Critical: ReactFlow must be dynamically imported with ssr:false
// because it uses browser-only APIs (ResizeObserver, DOM measurements)
const AutomationEditor = dynamic(
  () => import('@/components/editor/AutomationEditor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center glass-panel rounded-2xl border border-outline-variant/15">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin block mb-3">progress_activity</span>
          <p className="text-on-surface-variant text-sm">Loading editor…</p>
        </div>
      </div>
    ),
  }
);

export default function AutomationEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState(isNew ? 'New Automation' : '');
  const [description, setDescription] = useState('');
  const [loadedNodes, setLoadedNodes] = useState<Node[] | undefined>(undefined);
  const [loadedEdges, setLoadedEdges] = useState<Edge[] | undefined>(undefined);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  // Keep latest nodes/edges in a ref so Save can access them without stale closure
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);

  const handleEditorChange = useCallback((nodes: Node[], edges: Edge[]) => {
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, []);

  useEffect(() => {
    if (isNew) return;

    fetch('/api/sequences')
      .then((r) => r.json())
      .then((data: any[]) => {
        const seq = data.find((d) => String(d.id) === id);
        if (!seq) {
          toast.error('Automation not found');
          router.push('/automations');
          return;
        }
        setName(seq.name || 'Untitled');
        setDescription(seq.description || '');

        // Defensively parse nodes & edges, ensuring positions are valid
        const rawNodes: Node[] = Array.isArray(seq.nodes) ? seq.nodes : [];
        const rawEdges: Edge[] = Array.isArray(seq.edges) ? seq.edges : [];

        const safeNodes = rawNodes.map((n) => ({
          ...n,
          position: {
            x: typeof n.position?.x === 'number' ? n.position.x : 0,
            y: typeof n.position?.y === 'number' ? n.position.y : 0,
          },
        }));

        setLoadedNodes(safeNodes.length > 0 ? safeNodes : undefined);
        setLoadedEdges(rawEdges.length > 0 ? rawEdges : undefined);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[AutomationEditorPage load]', err);
        toast.error('Failed to load automation');
        setLoading(false);
      });
  }, [id, isNew, router, toast]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for this automation.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        nodes: nodesRef.current,
        edges: edgesRef.current,
      };

      const url = isNew ? '/api/sequences' : `/api/sequences/${id}`;
      const method = isNew ? 'POST' : 'PATCH';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      const saved = await res.json();
      toast.success('Automation saved!');

      if (isNew) {
        router.replace(`/automations/${saved.id}`);
      }
    } catch (err) {
      toast.error('Failed to save automation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-160px)] flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-primary animate-spin block mb-4">progress_activity</span>
          <p className="text-on-surface-variant">Loading automation…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 128px)' }}>
      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 border border-outline-variant/15 flex items-center gap-4 flex-wrap shrink-0">
        <button
          onClick={() => router.push('/automations')}
          className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
          title="Back to automations"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>

        <div className="flex-1 min-w-[200px] space-y-0.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Automation name…"
            className="w-full bg-transparent border-none text-xl font-bold headline-font text-on-surface outline-none placeholder:text-on-surface-variant/30"
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description (optional)"
            className="w-full bg-transparent border-none text-sm text-on-surface-variant outline-none placeholder:text-on-surface-variant/30"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/15 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-sm text-tertiary">info</span>
            Drag nodes · Connect handles · Save
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl ethereal-gradient text-[#0b0e14] font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105 transition-all disabled:opacity-60 disabled:scale-100"
          >
            <span className="material-symbols-outlined text-base">save</span>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 glass-panel rounded-2xl border border-outline-variant/15 overflow-hidden min-h-0">
        <AutomationEditor
          initialNodes={loadedNodes}
          initialEdges={loadedEdges}
          onChange={handleEditorChange}
        />
      </div>
    </div>
  );
}
