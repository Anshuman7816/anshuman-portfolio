import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        path: file.path,
        content: file.content,
        language: file.language,
        size: file.size,
        createdAt: file.createdAt,
        analyses: file.analyses.map(a => ({
          id: a.id,
          type: a.type,
          results: JSON.parse(a.results),
          severity: a.severity,
          status: a.status,
          createdAt: a.createdAt
        }))
      }
    })
  } catch (error) {
    console.error('Error fetching file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch file' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.file.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    )
  }
}
