export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface File {
  id: string;
  projectId: string;
  path: string;
  content: string;
  language: string | null;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analysis {
  id: string;
  fileId: string;
  type: 'bug' | 'security' | 'performance' | 'quality' | 'documentation';
  results: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface AnalysisResult {
  type: 'bug' | 'security' | 'performance' | 'quality' | 'documentation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  code?: string;
}

export interface FileAnalysis {
  fileId: string;
  fileName: string;
  language: string;
  results: AnalysisResult[];
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
