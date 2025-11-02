'use client'

import { useState } from 'react'

interface FileNode {
  id: string
  path: string
  language?: string
  size: number
  analysisCount?: number
}

interface FileTreeProps {
  files: FileNode[]
  onFileSelect: (file: FileNode) => void
  selectedFileId?: string
}

interface TreeNode {
  name: string
  type: 'file' | 'folder'
  children?: TreeNode[]
  file?: FileNode
}

export default function FileTree({ files, onFileSelect, selectedFileId }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']))

  const buildTree = (files: FileNode[]): TreeNode => {
    const root: TreeNode = { name: '/', type: 'folder', children: [] }

    files.forEach(file => {
      const parts = file.path.split('/')
      let current = root

      parts.forEach((part, index) => {
        if (!current.children) current.children = []

        if (index === parts.length - 1) {
          current.children.push({
            name: part,
            type: 'file',
            file
          })
        } else {
          let folder = current.children.find(
            child => child.name === part && child.type === 'folder'
          )
          if (!folder) {
            folder = { name: part, type: 'folder', children: [] }
            current.children.push(folder)
          }
          current = folder
        }
      })
    })

    return root
  }

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const renderNode = (node: TreeNode, path: string, depth: number): React.ReactNode => {
    const fullPath = path + node.name + (node.type === 'folder' ? '/' : '')
    const isExpanded = expandedFolders.has(fullPath)
    const isSelected = node.file?.id === selectedFileId

    if (node.type === 'folder') {
      return (
        <div key={fullPath}>
          <div
            onClick={() => toggleFolder(fullPath)}
            className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
          >
            <span className="text-sm">{isExpanded ? '📂' : '📁'}</span>
            <span className="text-sm font-medium">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map(child => renderNode(child, fullPath, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        key={fullPath}
        onClick={() => node.file && onFileSelect(node.file)}
        className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 cursor-pointer rounded ${
          isSelected ? 'bg-blue-100' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span className="text-sm">📄</span>
        <span className="text-sm flex-1">{node.name}</span>
        {node.file?.analysisCount && node.file.analysisCount > 0 && (
          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
            {node.file.analysisCount}
          </span>
        )}
      </div>
    )
  }

  const tree = buildTree(files)

  return (
    <div className="border rounded-lg bg-white overflow-auto" style={{ maxHeight: '600px' }}>
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold text-gray-700">Project Files</h3>
        <p className="text-xs text-gray-500 mt-1">{files.length} files</p>
      </div>
      <div className="p-2">
        {tree.children && tree.children.length > 0 ? (
          tree.children.map(child => renderNode(child, '/', 0))
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No files uploaded yet</p>
        )}
      </div>
    </div>
  )
}
