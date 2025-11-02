import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    
    const files = await prisma.file.findMany({
      where: { projectId },
      include: {
        analyses: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    const allAnalyses = files.flatMap(file => 
      file.analyses.map(analysis => ({
        id: analysis.id,
        fileId: file.id,
        filePath: file.path,
        type: analysis.type,
        results: JSON.parse(analysis.results),
        severity: analysis.severity,
        status: analysis.status,
        createdAt: analysis.createdAt
      }))
    )

    // Calculate statistics
    const stats = {
      totalFiles: files.length,
      analyzedFiles: files.filter(f => f.analyses.length > 0).length,
      totalIssues: allAnalyses.reduce((sum, a) => sum + a.results.length, 0),
      criticalIssues: allAnalyses.filter(a => a.severity === 'critical').length,
      highIssues: allAnalyses.filter(a => a.severity === 'high').length,
      mediumIssues: allAnalyses.filter(a => a.severity === 'medium').length,
      lowIssues: allAnalyses.filter(a => a.severity === 'low').length,
      byType: {
        bug: allAnalyses.filter(a => a.type === 'bug').length,
        security: allAnalyses.filter(a => a.type === 'security').length,
        performance: allAnalyses.filter(a => a.type === 'performance').length,
        quality: allAnalyses.filter(a => a.type === 'quality').length,
        documentation: allAnalyses.filter(a => a.type === 'documentation').length,
      }
    }

    return NextResponse.json({
      success: true,
      analyses: allAnalyses,
      stats
    })
  } catch (error) {
    console.error('Error fetching project analyses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analyses' },
      { status: 500 }
    )
  }
}
