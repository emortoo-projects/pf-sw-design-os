"use client";

import { useState, useCallback } from "react";

type NodeType = "trigger" | "agent" | "condition" | "parallel" | "action";

interface CanvasNode {
  id: string;
  type: NodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, unknown>;
}

interface CanvasEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

interface PaletteItemData {
  label: string;
  type: NodeType;
  icon: string;
}

const mockNodes: CanvasNode[] = [
  { id: "n1", type: "trigger", label: "Webhook Trigger", x: 100, y: 200, config: { method: "POST", path: "/ingest" } },
  { id: "n2", type: "agent", label: "Research Bot", x: 350, y: 120, config: { agentId: "1", model: "gpt-4" } },
  { id: "n3", type: "agent", label: "Data Extractor", x: 350, y: 280, config: { agentId: "3", model: "gpt-4-turbo" } },
  { id: "n4", type: "condition", label: "Quality Check", x: 600, y: 200, config: { condition: "score > 0.8" } },
  { id: "n5", type: "agent", label: "Report Writer", x: 850, y: 120, config: { agentId: "5", model: "gpt-4" } },
  { id: "n6", type: "action", label: "Notify Error", x: 850, y: 280, config: { action: "send_notification" } },
];

const mockEdges: CanvasEdge[] = [
  { id: "e1", source: "n1", target: "n2" },
  { id: "e2", source: "n1", target: "n3" },
  { id: "e3", source: "n2", target: "n4" },
  { id: "e4", source: "n3", target: "n4" },
  { id: "e5", source: "n4", target: "n5", label: "pass" },
  { id: "e6", source: "n4", target: "n6", label: "fail" },
];

const paletteItems: { section: string; items: PaletteItemData[] }[] = [
  {
    section: "Triggers",
    items: [
      { label: "Webhook", type: "trigger", icon: "W" },
      { label: "Schedule", type: "trigger", icon: "S" },
      { label: "Manual", type: "trigger", icon: "M" },
    ],
  },
  {
    section: "Control Flow",
    items: [
      { label: "Condition", type: "condition", icon: "?" },
      { label: "Parallel", type: "parallel", icon: "||" },
    ],
  },
  {
    section: "Agents",
    items: [
      { label: "Research Bot", type: "agent", icon: "A" },
      { label: "Code Reviewer", type: "agent", icon: "A" },
      { label: "Data Extractor", type: "agent", icon: "A" },
    ],
  },
  {
    section: "Actions",
    items: [
      { label: "HTTP Request", type: "action", icon: "H" },
      { label: "Send Email", type: "action", icon: "E" },
      { label: "Store Data", type: "action", icon: "D" },
    ],
  },
];

const nodeTypeColors: Record<NodeType, { bg: string; border: string; badge: string }> = {
  trigger: { bg: "bg-warning-50", border: "border-warning-300", badge: "bg-warning-400" },
  agent: { bg: "bg-primary-50", border: "border-primary-300", badge: "bg-primary-400" },
  condition: { bg: "bg-secondary-50", border: "border-secondary-300", badge: "bg-secondary-400" },
  parallel: { bg: "bg-accent-50", border: "border-accent-300", badge: "bg-accent-400" },
  action: { bg: "bg-neutral-50", border: "border-neutral-300", badge: "bg-neutral-400" },
};

function VersionIndicator({ version, hasChanges }: { version: number; hasChanges: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-neutral-500">v{version}</span>
      {hasChanges && <span className="h-2 w-2 rounded-full bg-warning-400" title="Unsaved changes" />}
    </div>
  );
}

function CanvasToolbar({
  workflowName,
  version,
  hasChanges,
  onSave,
  onExecute,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
}: {
  workflowName: string;
  version: number;
  hasChanges: boolean;
  onSave: () => void;
  onExecute: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-neutral-200 bg-white px-4">
      <div className="flex items-center gap-4">
        <a href="/workflows" className="text-sm text-neutral-500 hover:text-primary-600">&larr; Back</a>
        <span className="text-sm font-semibold text-neutral-900">{workflowName}</span>
        <VersionIndicator version={version} hasChanges={hasChanges} />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onUndo} disabled={!canUndo} className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30" title="Undo">
          Undo
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="rounded px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30" title="Redo">
          Redo
        </button>
        <div className="mx-2 h-4 w-px bg-neutral-200" />
        <button onClick={onSave} className="rounded-md border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          Save
        </button>
        <button onClick={onExecute} className="rounded-md bg-primary-600 px-3 py-1 text-xs font-medium text-white hover:bg-primary-700">
          Execute
        </button>
      </div>
    </div>
  );
}

function PaletteSection({
  title,
  defaultExpanded,
  children,
}: {
  title: string;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded ?? true);
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-wide text-neutral-500"
      >
        {title}
        <span>{expanded ? "−" : "+"}</span>
      </button>
      {expanded && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function PaletteItem({ item }: { item: PaletteItemData }) {
  const colors = nodeTypeColors[item.type];
  return (
    <div
      draggable
      className={`flex cursor-grab items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs ${colors.bg} ${colors.border} active:cursor-grabbing`}
    >
      <span className={`flex h-5 w-5 items-center justify-center rounded text-xs font-bold text-white ${colors.badge}`}>
        {item.icon}
      </span>
      <span className="text-neutral-700">{item.label}</span>
    </div>
  );
}

function NodePalette() {
  return (
    <div className="w-56 flex-shrink-0 overflow-y-auto border-r border-neutral-200 bg-white p-3">
      <p className="text-xs font-semibold text-neutral-900 mb-3">Node Palette</p>
      <div className="space-y-3">
        {paletteItems.map((section) => (
          <PaletteSection key={section.section} title={section.section}>
            {section.items.map((item) => (
              <PaletteItem key={item.label} item={item} />
            ))}
          </PaletteSection>
        ))}
      </div>
    </div>
  );
}

function CanvasNodeComponent({
  node,
  selected,
  onClick,
}: {
  node: CanvasNode;
  selected: boolean;
  onClick: () => void;
}) {
  const colors = nodeTypeColors[node.type];
  return (
    <div
      onClick={onClick}
      className={`absolute cursor-pointer rounded-lg border-2 px-4 py-3 shadow-sm transition-shadow ${colors.bg} ${
        selected ? "border-primary-500 shadow-md ring-2 ring-primary-200" : colors.border
      }`}
      style={{ left: node.x, top: node.y, minWidth: 140 }}
    >
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${colors.badge}`}>
          {node.type.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-xs font-semibold text-neutral-900">{node.label}</p>
          <p className="text-xs text-neutral-500">{node.type}</p>
        </div>
      </div>
    </div>
  );
}

function CanvasEdgeLine({ edge, nodes }: { edge: CanvasEdge; nodes: CanvasNode[] }) {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target) return null;

  const x1 = source.x + 140;
  const y1 = source.y + 24;
  const x2 = target.x;
  const y2 = target.y + 24;
  const mx = (x1 + x2) / 2;

  return (
    <g>
      <path
        d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
        fill="none"
        stroke="#d4d4d4"
        strokeWidth={2}
      />
      {edge.label && (
        <text x={mx} y={(y1 + y2) / 2 - 8} textAnchor="middle" className="fill-neutral-400 text-xs">
          {edge.label}
        </text>
      )}
      <circle cx={x2} cy={y2} r={3} fill="#a3a3a3" />
    </g>
  );
}

function WorkflowCanvasArea({
  nodes,
  edges,
  selectedNode,
  onSelectNode,
}: {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNode: string | null;
  onSelectNode: (id: string | null) => void;
}) {
  return (
    <div
      className="relative flex-1 overflow-auto bg-neutral-50"
      onClick={() => onSelectNode(null)}
      style={{ backgroundImage: "radial-gradient(circle, #d4d4d4 1px, transparent 1px)", backgroundSize: "24px 24px" }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {edges.map((edge) => (
          <CanvasEdgeLine key={edge.id} edge={edge} nodes={nodes} />
        ))}
      </svg>
      {nodes.map((node) => (
        <CanvasNodeComponent
          key={node.id}
          node={node}
          selected={selectedNode === node.id}
          onClick={() => onSelectNode(node.id)}
        />
      ))}
    </div>
  );
}

function NodeConfigForm({
  node,
  onUpdate,
}: {
  node: CanvasNode;
  onUpdate: (key: string, value: unknown) => void;
}) {
  const configEntries = Object.entries(node.config);

  return (
    <div className="space-y-3">
      {configEntries.map(([key, value]) => (
        <div key={key}>
          <label className="block text-xs font-medium text-neutral-500">{key}</label>
          <input
            value={String(value)}
            onChange={(e) => onUpdate(key, e.target.value)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      ))}
    </div>
  );
}

function NodeInspector({
  node,
  onUpdate,
  onDelete,
}: {
  node: CanvasNode | null;
  onUpdate: (key: string, value: unknown) => void;
  onDelete: () => void;
}) {
  if (!node) {
    return (
      <div className="flex w-64 flex-shrink-0 items-center justify-center border-l border-neutral-200 bg-white p-4">
        <p className="text-xs text-neutral-400">Select a node to inspect</p>
      </div>
    );
  }

  const colors = nodeTypeColors[node.type];
  return (
    <div className="w-64 flex-shrink-0 overflow-y-auto border-l border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold text-white ${colors.badge}`}>
          {node.type.charAt(0).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral-900">{node.label}</p>
          <p className="text-xs text-neutral-500">{node.type}</p>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-xs font-medium text-neutral-500">Label</label>
        <input
          value={node.label}
          readOnly
          className="mt-1 w-full rounded-md border border-neutral-300 px-2.5 py-1.5 text-xs bg-neutral-50"
        />
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold text-neutral-700">Configuration</p>
        <div className="mt-2">
          <NodeConfigForm node={node} onUpdate={onUpdate} />
        </div>
      </div>

      <div className="mt-6">
        <button onClick={onDelete} className="w-full rounded-md border border-error-300 px-3 py-1.5 text-xs font-medium text-error-700 hover:bg-error-50">
          Delete Node
        </button>
      </div>
    </div>
  );
}

export default function WorkflowCanvasPage() {
  const [nodes] = useState(mockNodes);
  const [edges] = useState(mockEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const selected = nodes.find((n) => n.id === selectedNode) ?? null;

  const handleSave = useCallback(() => {
    setHasChanges(false);
  }, []);

  const handleUpdate = useCallback((_key: string, _value: unknown) => {
    setHasChanges(true);
  }, []);

  const handleDelete = useCallback(() => {
    setSelectedNode(null);
    setHasChanges(true);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <CanvasToolbar
        workflowName="Content Pipeline"
        version={3}
        hasChanges={hasChanges}
        onSave={handleSave}
        onExecute={() => {}}
        canUndo={false}
        canRedo={false}
        onUndo={() => {}}
        onRedo={() => {}}
      />
      <div className="flex flex-1 overflow-hidden">
        <NodePalette />
        <WorkflowCanvasArea
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          onSelectNode={setSelectedNode}
        />
        <NodeInspector node={selected} onUpdate={handleUpdate} onDelete={handleDelete} />
      </div>
    </div>
  );
}
