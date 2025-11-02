export interface AnalysisResult {
  type: 'bug' | 'security' | 'performance' | 'quality' | 'documentation'
  severity: 'low' | 'medium' | 'high' | 'critical'
  line?: number
  column?: number
  message: string
  suggestion?: string
  code?: string
}

export interface FileUpload {
  path: string
  content: string
  language?: string
  size: number
}

export interface ProjectData {
  id: string
  name: string
  description?: string
  createdAt: Date
  fileCount?: number
}

export interface FileData {
  id: string
  path: string
  content: string
  language?: string
  size: number
  createdAt: Date
}

export interface AnalysisData {
  id: string
  fileId: string
  type: string
  results: AnalysisResult[]
  severity: string
  status: string
  createdAt: Date
}
