'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  fileCount: number
}

export default function Home() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects', {
        headers: {
          'x-user-id': 'demo-user'
        }
      })
      const data = await response.json()
      if (data.success) {
        setProjects(data.projects)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return

    setCreating(true)
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          name: newProjectName,
          description: newProjectDescription
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowCreateModal(false)
        setNewProjectName('')
        setNewProjectDescription('')
        router.push(`/project/${data.project.id}`)
      }
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Code Review System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your codebase and let AI analyze it for bugs, security vulnerabilities,
            performance issues, and code quality improvements.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              + New Project
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No projects yet
              </h3>
              <p className="text-gray-500 mb-6">
                Create your first project to get started with AI code review
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/project/${project.id}`)}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📂</div>
                    <span className="text-xs text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>📄 {project.fileCount} files</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Create New Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="My Awesome Project"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={creating || !newProjectName.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
