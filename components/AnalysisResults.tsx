'use client'

import { AnalysisResult } from '@/lib/types'

interface AnalysisResultsProps {
  analyses: {
    id: string
    type: string
    results: AnalysisResult[]
    severity: string
    createdAt: Date
  }[]
  onLineClick?: (line: number) => void
}

export default function AnalysisResults({ analyses, onLineClick }: AnalysisResultsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug':
        return '🐛'
      case 'security':
        return '🔒'
      case 'performance':
        return '⚡'
      case 'quality':
        return '✨'
      case 'documentation':
        return '📝'
      default:
        return '📋'
    }
  }

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  if (analyses.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center bg-white">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-lg font-semibold text-gray-700">No issues found!</p>
        <p className="text-sm text-gray-500 mt-2">
          This file looks good or hasn&apos;t been analyzed yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {analyses.map(analysis => (
        <div key={analysis.id} className="border rounded-lg bg-white overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getTypeIcon(analysis.type)}</span>
              <div>
                <h3 className="font-semibold text-gray-800">
                  {getTypeLabel(analysis.type)} Analysis
                </h3>
                <p className="text-xs text-gray-500">
                  {analysis.results.length} issue{analysis.results.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                analysis.severity
              )}`}
            >
              {analysis.severity.toUpperCase()}
            </span>
          </div>

          <div className="divide-y">
            {analysis.results.map((result, index) => (
              <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${getSeverityColor(
                          result.severity
                        )}`}
                      >
                        {result.severity}
                      </span>
                      {result.line && (
                        <button
                          onClick={() => onLineClick && onLineClick(result.line!)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-mono"
                        >
                          Line {result.line}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 font-medium mb-2">
                      {result.message}
                    </p>
                    {result.suggestion && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs font-semibold text-green-800 mb-1">
                          💡 Suggestion:
                        </p>
                        <p className="text-sm text-green-700">{result.suggestion}</p>
                      </div>
                    )}
                    {result.code && (
                      <div className="mt-2 p-3 bg-gray-900 rounded overflow-x-auto">
                        <pre className="text-xs font-mono text-gray-100">
                          {result.code}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
