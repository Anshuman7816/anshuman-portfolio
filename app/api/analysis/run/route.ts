import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AIAnalyzer } from '@/lib/ai-analyzer'
import { FileHandler } from '@/lib/file-handler'
import { AnalysisResult } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fileId, analysisTypes } = body

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'File ID is required' },
        { status: 400 }
      )
    }

    const file = await prisma.file.findUnique({
      where: { id: fileId }
    })

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if file should be analyzed
    if (!FileHandler.shouldAnalyzeFile(file.path)) {
      return NextResponse.json(
        { success: false, error: 'File type not supported for analysis' },
        { status: 400 }
      )
    }

    const types = analysisTypes || ['bug', 'security', 'performance', 'quality', 'documentation']
    const analyses = []

    for (const type of types) {
      let results: AnalysisResult[] = []
      
      switch (type) {
        case 'bug':
          results = await AIAnalyzer.analyzeBugs(file.content, file.path)
          break
        case 'security':
          results = await AIAnalyzer.analyzeSecurity(file.content, file.path)
          break
        case 'performance':
          results = await AIAnalyzer.analyzePerformance(file.content, file.path)
          break
        case 'quality':
          results = await AIAnalyzer.analyzeQuality(file.content, file.path)
          break
        case 'documentation':
          results = await AIAnalyzer.analyzeDocumentation(file.content, file.path)
          break
      }

      // Determine overall severity
      const severities = results.map(r => r.severity)
      const severity = severities.includes('critical') ? 'critical' :
                      severities.includes('high') ? 'high' :
                      severities.includes('medium') ? 'medium' : 'low'

      const analysis = await prisma.analysis.create({
        data: {
          fileId,
          type,
          results: JSON.stringify(results),
          severity,
          status: 'completed'
        }
      })

      analyses.push({
        id: analysis.id,
        type: analysis.type,
        results,
        severity: analysis.severity,
        status: analysis.status,
        createdAt: analysis.createdAt
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Analysis completed successfully',
      analyses
    })
  } catch (error) {
    console.error('Error running analysis:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to run analysis' },
      { status: 500 }
    )
  }
}
