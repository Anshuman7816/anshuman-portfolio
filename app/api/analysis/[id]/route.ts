import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const analysis = await prisma.analysis.findUnique({
      where: { id },
      include: {
        file: {
          select: {
            path: true,
            language: true
          }
        }
      }
    })

    if (!analysis) {
      return NextResponse.json(
        { success: false, error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        type: analysis.type,
        results: JSON.parse(analysis.results),
        severity: analysis.severity,
        status: analysis.status,
        createdAt: analysis.createdAt,
        file: analysis.file
      }
    })
  } catch (error) {
    console.error('Error fetching analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analysis' },
      { status: 500 }
    )
  }
}
