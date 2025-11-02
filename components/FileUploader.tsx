'use client'

import { useState, useCallback } from 'react'

interface FileUploaderProps {
  projectId: string
  onUploadComplete: () => void
}

export default function FileUploader({ projectId, onUploadComplete }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFiles = async (items: DataTransferItemList | FileList) => {
    const files: { path: string; content: string }[] = []

    const readFile = (file: File, path: string): Promise<void> => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          files.push({ path, content })
          resolve()
        }
        reader.readAsText(file)
      })
    }

    const processEntry = async (entry: FileSystemEntry, path = ''): Promise<void> => {
      if (entry.isFile) {
        return new Promise((resolve) => {
          (entry as FileSystemFileEntry).file(async (file: File) => {
            await readFile(file, path + file.name)
            resolve()
          })
        })
      } else if (entry.isDirectory) {
        const reader = (entry as FileSystemDirectoryEntry).createReader()
        return new Promise((resolve) => {
          reader.readEntries(async (entries: FileSystemEntry[]) => {
            for (const childEntry of entries) {
              await processEntry(childEntry, path + entry.name + '/')
            }
            resolve()
          })
        })
      }
    }

    if ('length' in items && items[0] && 'webkitGetAsEntry' in items[0]) {
      const dataTransferItems = items as DataTransferItemList
      for (let i = 0; i < dataTransferItems.length; i++) {
        const item = dataTransferItems[i]
        const entry = item.webkitGetAsEntry()
        if (entry) {
          await processEntry(entry)
        }
      }
    } else {
      const fileList = items as FileList
      for (let i = 0; i < fileList.length; i++) {
        await readFile(fileList[i], fileList[i].name)
      }
    }

    return files
  }

  const uploadFiles = async (files: { path: string; content: string }[]) => {
    setUploading(true)
    setUploadStatus(`Uploading ${files.length} files...`)

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          projectId,
          files
        })
      })

      const data = await response.json()

      if (data.success) {
        setUploadStatus(`Successfully uploaded ${files.length} files!`)
        setTimeout(() => {
          setUploadStatus('')
          onUploadComplete()
        }, 2000)
      } else {
        setUploadStatus(`Error: ${data.error}`)
      }
    } catch {
      setUploadStatus('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = await processFiles(e.dataTransfer.items || e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFiles(files)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = await processFiles(e.target.files)
      if (files.length > 0) {
        await uploadFiles(files)
      }
    }
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="space-y-4">
          <div className="text-6xl">📁</div>
          <div>
            <p className="text-xl font-semibold text-gray-700">
              Drop your files or folders here
            </p>
            <p className="text-sm text-gray-500 mt-2">
              or click to browse
            </p>
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
          >
            Select Files
          </label>
        </div>
      </div>

      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg ${
          uploading ? 'bg-blue-100 text-blue-800' : 
          uploadStatus.includes('Error') ? 'bg-red-100 text-red-800' : 
          'bg-green-100 text-green-800'
        }`}>
          {uploadStatus}
        </div>
      )}
    </div>
  )
}
