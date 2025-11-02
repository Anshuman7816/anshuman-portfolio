'use client'

interface CodeViewerProps {
  code: string
  language?: string
  highlightLines?: number[]
}

export default function CodeViewer({ code, language, highlightLines = [] }: CodeViewerProps) {
  const lines = code.split('\n')

  return (
    <div className="border rounded-lg bg-gray-900 overflow-hidden">
      <div className="px-4 py-2 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm text-gray-300 font-mono">{language || 'plaintext'}</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-xs px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
        >
          Copy
        </button>
      </div>
      <div className="overflow-auto" style={{ maxHeight: '500px' }}>
        <table className="w-full">
          <tbody>
            {lines.map((line, index) => {
              const lineNumber = index + 1
              const isHighlighted = highlightLines.includes(lineNumber)
              
              return (
                <tr
                  key={index}
                  className={isHighlighted ? 'bg-yellow-900 bg-opacity-30' : ''}
                >
                  <td className="px-4 py-1 text-right text-gray-500 select-none border-r border-gray-700 bg-gray-800 sticky left-0">
                    <span className="text-xs font-mono">{lineNumber}</span>
                  </td>
                  <td className="px-4 py-1">
                    <pre className="text-sm font-mono text-gray-100 whitespace-pre">
                      {line || ' '}
                    </pre>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
