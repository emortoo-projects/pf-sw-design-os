import type { SectionSpec, ComponentNode } from './types'

interface SectionPreviewProps {
  section: SectionSpec
}

function ComponentBox({ node, depth }: { node: ComponentNode; depth: number }) {
  return (
    <div
      className="rounded-md border border-primary-200 bg-primary-50/50 p-2"
      style={{ marginLeft: depth > 0 ? 12 : 0 }}
    >
      <span className="text-xs font-medium text-primary-800">{node.name}</span>
      {node.children.length > 0 && (
        <div className="mt-1.5 space-y-1.5 rounded bg-zinc-100 p-1.5">
          {node.children.map((child) => (
            <ComponentBox key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function SectionPreview({ section }: SectionPreviewProps) {
  if (section.components.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-200 p-4 text-center">
        <p className="text-xs text-zinc-400">No components to preview</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-700">Component Preview</label>
      <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        {section.components.map((comp) => (
          <ComponentBox key={comp.id} node={comp} depth={0} />
        ))}
      </div>
    </div>
  )
}
