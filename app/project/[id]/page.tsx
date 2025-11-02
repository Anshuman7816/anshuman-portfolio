'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import FileUploader from '@/components/FileUploader'
import FileTree from '@/components/FileTree'
import CodeViewer from '@/components/CodeViewer'
import AnalysisResults from '@/components/AnalysisResults'

interface FileNode {
  id: string
  path: string
  language?: string
  size: number
  analysisCount?: number
}

interface AnalysisResultItem {
  type: string
  severity: string
  line?: number
  message: string
  suggestion?: string
  code?: string
}

interface Analysis {
  id: string
  type: string
  results: AnalysisResultItem[]
  severity: string
  status: string
  createdAt: Date
}

interface FileDetail {
  id: string
  path: string
  content: string
  language?: string
  analyses: Analysis[]
}

interface Project {
  id: string
  name: string
  description?: string
  files: FileNode[]
}

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [highlightLines, setHighlightLines] = useState<number[]>([])

  useEffect(() => {
    fetchProject()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${resolvedParams.id}`)
      const data = await response.json()
      if (data.success) {
        setProject(data.project)
        setShowUploader(data.project.files.length === 0)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFileDetails = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedFile(data.file)
        setHighlightLines([])
      }
    } catch (error) {
      console.error('Error fetching file:', error)
    }
  }

  const runAnalysis = async () => {
    if (!selectedFile) return

    setAnalyzing(true)
    try {
      const response = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId: selectedFile.id,
          analysisTypes: ['bug', 'security', 'performance', 'quality', 'documentation']
        })
      })

      const data = await response.json()
      if (data.success) {
        await fetchFileDetails(selectedFile.id)
        await fetchProject()
      }
    } catch (error) {
      console.error('Error running analysis:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleLineClick = (line: number) => {
    setHighlightLines([line])
    const element = document.querySelector(`tr:nth-child(${line})`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Project not found</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
                {project.description && (
                  <p className="text-sm text-gray-600">{project.description}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showUploader ? 'Hide Uploader' : '+ Upload Files'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {showUploader && (
          <div className="mb-6">
            <FileUploader
              projectId={project.id}
              onUploadComplete={() => {
                fetchProject()
                setShowUploader(false)
              }}
            />
          </div>
        )}

        {project.files.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No files uploaded yet
            </h3>
            <p className="text-gray-500">
              Upload your codebase to start analyzing
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-3">
              <FileTree
                files={project.files}
                onFileSelect={(file) => fetchFileDetails(file.id)}
                selectedFileId={selectedFile?.id}
              />
            </div>

            <div className="col-span-9">
              {selectedFile ? (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-800">
                          {selectedFile.path}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {selectedFile.language} • {(selectedFile.content.length / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={runAnalysis}
                        disabled={analyzing}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {analyzing ? 'Analyzing...' : '🔍 Analyze'}
                      </button>
                    </div>
                    <CodeViewer
                      code={selectedFile.content}
                      language={selectedFile.language}
                      highlightLines={highlightLines}
                    />
                  </div>

                  {selectedFile.analyses.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Analysis Results
                      </h3>
                      <AnalysisResults
                        analyses={selectedFile.analyses}
                        onLineClick={handleLineClick}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select a file to view
                  </h3>
                  <p className="text-gray-500">
                    Choose a file from the tree to see its contents and analysis
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
