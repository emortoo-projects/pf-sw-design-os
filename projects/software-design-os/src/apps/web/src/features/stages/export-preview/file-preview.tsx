import { useState } from 'react'
import { SchemaPreview } from '@/features/stages/database-designer/schema-preview'
import type { SDPFileNode } from './types'

interface FilePreviewProps {
  filePath: string | null
  file: SDPFileNode | null
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(md: string): string {
  let html = escapeHtml(md)
    // Fenced code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-zinc-800 text-zinc-100 p-3 rounded-lg text-xs overflow-auto my-2"><code>$2</code></pre>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr class="border-zinc-200 my-4" />')
    // Headings (process after code blocks to avoid matching inside them)
    .replace(/^#### (.+)$/gm, '<h4 class="text-sm font-semibold text-zinc-800 mt-4 mb-1">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold text-zinc-800 mt-4 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-zinc-900 mt-6 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-zinc-900 mt-4 mb-2">$1</h1>')
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-zinc-300 pl-3 text-zinc-600 italic my-2">$1</blockquote>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-100 px-1 py-0.5 rounded text-xs font-mono text-zinc-700">$1</code>')
    // Table rows
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter((c) => c.trim() !== '')
      if (cells.every((c) => /^[\s-]+$/.test(c))) return ''
      const cellHtml = cells.map((c) => `<td class="border border-zinc-200 px-2 py-1 text-sm">${c.trim()}</td>`).join('')
      return `<tr>${cellHtml}</tr>`
    })
    // Unordered list items
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm text-zinc-700 list-disc">$1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-sm text-zinc-700 list-decimal">$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/((?:<li[^>]*>.*<\/li>\n?)+)/g, '<ul class="my-2 space-y-0.5">$1</ul>')
    // Wrap <tr> in <table>
    .replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table class="border-collapse my-2 text-sm w-full">$1</table>')
    // Paragraphs — lines that aren't already HTML
    .replace(/^(?!<[a-z])(.+)$/gm, '<p class="text-sm text-zinc-700 my-1">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p[^>]*>\s*<\/p>/g, '')

  return html
}

export function FilePreview({ filePath, file }: FilePreviewProps) {
  const [mdMode, setMdMode] = useState<'rendered' | 'source'>('rendered')

  if (!filePath || !file) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-zinc-400">Select a file from the tree to preview its contents</p>
      </div>
    )
  }

  const breadcrumb = filePath
    .split('/')
    .filter(Boolean)
    .join(' / ')

  const languageMap: Record<string, 'json' | 'sql' | 'yaml' | 'markdown'> = {
    json: 'json',
    sql: 'sql',
    yaml: 'yaml',
    md: 'markdown',
  }
  const language = languageMap[file.format] ?? 'json'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2">
        <span className="text-xs font-mono text-zinc-500">{breadcrumb}</span>
        {file.format === 'md' && (
          <div className="flex rounded-md border border-zinc-200 text-xs">
            <button
              onClick={() => setMdMode('rendered')}
              className={`px-2 py-0.5 rounded-l-md ${mdMode === 'rendered' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >
              Rendered
            </button>
            <button
              onClick={() => setMdMode('source')}
              className={`px-2 py-0.5 rounded-r-md ${mdMode === 'source' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >
              Source
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {file.format === 'md' && mdMode === 'rendered' ? (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(file.content) }}
          />
        ) : (
          <SchemaPreview schema={file.content} language={language} />
        )}
      </div>
    </div>
  )
}
