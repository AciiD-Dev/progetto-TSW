'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ── Custom Node Types ─────────────────────────────────────────────────────────

function TriggerNode({ data }: { data: any }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-primary/40 bg-primary/10 backdrop-blur-sm shadow-lg shadow-primary/10 overflow-hidden">
      <div className="px-3 py-1.5 bg-primary/20 border-b border-primary/30 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-sm">bolt</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Trigger</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-on-surface">{data.label}</p>
        {data.description && <p className="text-xs text-on-surface-variant mt-0.5">{data.description}</p>}
      </div>
    </div>
  );
}

function ActionNode({ data }: { data: any }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-secondary/40 bg-secondary/10 backdrop-blur-sm shadow-lg shadow-secondary/10 overflow-hidden">
      <div className="px-3 py-1.5 bg-secondary/20 border-b border-secondary/30 flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-sm">play_arrow</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Action</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-on-surface">{data.label}</p>
        {data.description && <p className="text-xs text-on-surface-variant mt-0.5">{data.description}</p>}
      </div>
    </div>
  );
}

function ConditionNode({ data }: { data: any }) {
  return (
    <div className="min-w-[180px] rounded-xl border border-tertiary/40 bg-tertiary/10 backdrop-blur-sm shadow-lg shadow-tertiary/10 overflow-hidden">
      <div className="px-3 py-1.5 bg-tertiary/20 border-b border-tertiary/30 flex items-center gap-2">
        <span className="material-symbols-outlined text-tertiary text-sm">call_split</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Condition</span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-on-surface">{data.label}</p>
        {data.description && <p className="text-xs text-on-surface-variant mt-0.5">{data.description}</p>}
      </div>
    </div>
  );
}

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
};

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_NODES: Node[] = [
  {
    id: '1',
    type: 'trigger',
    position: { x: 100, y: 150 },
    data: { label: 'Temperature > 25°C', description: 'Thermostat sensor reading' },
  },
  {
    id: '2',
    type: 'condition',
    position: { x: 380, y: 80 },
    data: { label: 'Time is 08:00–22:00', description: 'Active hours check' },
  },
  {
    id: '3',
    type: 'action',
    position: { x: 660, y: 150 },
    data: { label: 'Turn ON Fan', description: 'Living Room fan device' },
  },
];

const DEFAULT_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#6dddff', strokeWidth: 2 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#d575ff', strokeWidth: 2 } },
];

// ── Node Palette ──────────────────────────────────────────────────────────────

const NODE_TEMPLATES = [
  { type: 'trigger',   label: 'Trigger',   icon: 'bolt',       color: 'text-primary',   desc: 'Start condition' },
  { type: 'condition', label: 'Condition', icon: 'call_split', color: 'text-tertiary',  desc: 'If/else branch' },
  { type: 'action',    label: 'Action',    icon: 'play_arrow', color: 'text-secondary', desc: 'Execute task' },
];

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onChange: (nodes: Node[], edges: Edge[]) => void;
}

export default function AutomationEditor({ initialNodes, initialEdges, onChange }: Props) {
  const safeNodes = (initialNodes && initialNodes.length > 0) ? initialNodes : DEFAULT_NODES;
  const safeEdges = (initialEdges && initialEdges.length > 0) ? initialEdges : DEFAULT_EDGES;

  const [nodes, setNodes, onNodesChange] = useNodesState(safeNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(safeEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    setNodes((nds) => {
      onChange(nds, edges);
      return nds;
    });
  }, [onNodesChange, setNodes, edges, onChange]);

  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    setEdges((eds) => {
      onChange(nodes, eds);
      return eds;
    });
  }, [onEdgesChange, setEdges, nodes, onChange]);

  const addNode = (type: string) => {
    const id = `node_${Date.now()}`;
    const template = NODE_TEMPLATES.find(t => t.type === type);
    const newNode: Node = {
      id,
      type,
      position: { x: 200 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: { label: `New ${template?.label || type}`, description: 'Click to configure' },
    };
    setNodes((nds) => {
      const updated = [...nds, newNode];
      onChange(updated, edges);
      return updated;
    });
  };

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        colorMode="dark"
        fitView
        fitViewOptions={{ padding: 0.3 }}
        defaultEdgeOptions={{ animated: true, style: { stroke: '#6dddff', strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(109, 221, 255, 0.08)"
        />
        <Controls
          style={{ background: 'rgba(27, 31, 39, 0.9)', border: '1px solid rgba(69,72,79,0.3)', borderRadius: '10px' }}
        />
        <MiniMap
          nodeStrokeWidth={2}
          zoomable
          pannable
          style={{ background: 'rgba(20, 23, 31, 0.9)', border: '1px solid rgba(69,72,79,0.3)', borderRadius: '8px' }}
          nodeColor={(n) => {
            if (n.type === 'trigger') return '#6dddff';
            if (n.type === 'action') return '#d575ff';
            if (n.type === 'condition') return '#8eff71';
            return '#45484f';
          }}
        />

        {/* Node Palette Panel */}
        <Panel position="top-left" style={{ margin: '12px' }}>
          <div className="glass-panel rounded-xl border border-outline-variant/20 p-3 shadow-xl">
            <p className="text-[9px] font-bold uppercase tracking-widest text-on-surface-variant mb-2 px-1">Add Node</p>
            <div className="flex flex-col gap-1.5">
              {NODE_TEMPLATES.map(({ type, label, icon, color, desc }) => (
                <button
                  key={type}
                  onClick={() => addNode(type)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
                >
                  <span className={`material-symbols-outlined text-base ${color}`}>{icon}</span>
                  <div>
                    <p className={`text-xs font-semibold ${color}`}>{label}</p>
                    <p className="text-[10px] text-on-surface-variant">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
