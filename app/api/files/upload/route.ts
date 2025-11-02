import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { FileHandler } from '@/lib/file-handler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, files } = body

    if (!projectId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      const { path, content } = file
      
      if (!path || content === undefined) {
        continue
      }

      const language = FileHandler.getFileLanguage(path)
      const size = Buffer.byteLength(content, 'utf-8')

      // Save file to disk
      await FileHandler.saveFile(projectId, path, content)

      // Save file metadata to database
      const dbFile = await prisma.file.upsert({
        where: {
          projectId_path: {
            projectId,
            path
          }
        },
        update: {
          content,
          language,
          size
        },
        create: {
          projectId,
          path,
          content,
          language,
          size
        }
      })

      uploadedFiles.push({
        id: dbFile.id,
        path: dbFile.path,
        language: dbFile.language,
        size: dbFile.size
      })
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}
