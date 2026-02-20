import JSZip from 'jszip'
import type { SDPFolderNode, SDPTreeNode } from './types'

function addNodeToZip(zip: JSZip, node: SDPTreeNode, path: string) {
  if (node.type === 'file') {
    zip.file(`${path}/${node.name}`, node.content)
  } else {
    const folderPath = `${path}/${node.name}`
    for (const child of node.children) {
      addNodeToZip(zip, child, folderPath)
    }
  }
}

export async function downloadAsZip(tree: SDPFolderNode, projectName: string): Promise<void> {
  const zip = new JSZip()

  // Add all children under the root folder name
  for (const child of tree.children) {
    addNodeToZip(zip, child, tree.name)
  }

  const blob = await zip.generateAsync({ type: 'blob' })
  const slug = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const filename = `${slug || 'sdp'}-sdp.zip`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
