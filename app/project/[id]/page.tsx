'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface File {
  id: string;
  path: string;
  language: string;
  size: number;
  content: string;
  _count: {
    analyses: number;
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  files: File[];
}

interface AnalysisResult {
  type: string;
  severity: string;
  line?: number;
  message: string;
  suggestion?: string;
  code?: string;
}

export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
    fetchProject();
  }, [projectId, router]);

  const fetchProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        if (data.project.files.length > 0 && !selectedFile) {
          setSelectedFile(data.project.files[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const fileDataArray = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.text();
      fileDataArray.push({
        path: file.name,
        content,
      });
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          files: fileDataArray,
        }),
      });

      if (response.ok) {
        fetchProject();
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setUploadingFiles(false);
    }
  };

  const runAnalysis = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/analysis/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileId: selectedFile.id,
          analysisTypes: ['bug', 'security', 'performance', 'quality'],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysisResults(data.results);
      }
    } catch (error) {
      console.error('Error running analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            </div>
            <div className="flex items-center gap-3">
              <label className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingFiles}
                />
              </label>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Files</h3>
            <div className="space-y-1">
              {project.files.length === 0 ? (
                <p className="text-sm text-gray-500">No files uploaded yet</p>
              ) : (
                project.files.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      setSelectedFile(file);
                      setAnalysisResults([]);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedFile?.id === file.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="truncate">{file.path}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {file.language} • {(file.size / 1024).toFixed(1)} KB
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="col-span-9 space-y-6">
            {selectedFile ? (
              <>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-900">
                      {selectedFile.path}
                    </h3>
                    <button
                      onClick={runAnalysis}
                      disabled={analyzing}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                      {analyzing ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800">
                      <code>{selectedFile.content}</code>
                    </pre>
                  </div>
                </div>

                {analysisResults.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Analysis Results ({analysisResults.length} issues found)
                    </h3>
                    <div className="space-y-4">
                      {analysisResults.map((result, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${getSeverityColor(
                            result.severity
                          )}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium capitalize">
                                {result.type}
                              </span>
                              <span className="text-xs px-2 py-1 rounded-full bg-white">
                                {result.severity}
                              </span>
                              {result.line && (
                                <span className="text-xs">Line {result.line}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm mb-2">{result.message}</p>
                          {result.suggestion && (
                            <p className="text-sm font-medium">
                              💡 {result.suggestion}
                            </p>
                          )}
                          {result.code && (
                            <pre className="mt-2 text-xs bg-white p-2 rounded overflow-x-auto">
                              <code>{result.code}</code>
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-600">
                  Select a file to view and analyze
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
