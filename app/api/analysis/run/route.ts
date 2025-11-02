import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { aiAnalyzer } from '@/lib/ai-analyzer';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileId, analysisTypes } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        project: {
          userId: user.userId,
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const types = analysisTypes || ['bug', 'security', 'performance', 'quality'];
    const results = await aiAnalyzer.analyzeCode(file.content, file.language || 'plaintext', types);

    const analyses = [];

    for (const result of results) {
      const analysis = await prisma.analysis.create({
        data: {
          fileId: file.id,
          type: result.type,
          results: JSON.stringify(result),
          severity: result.severity,
          status: 'completed',
        },
      });
      analyses.push(analysis);
    }

    const summary = aiAnalyzer.calculateSummary(results);

    return NextResponse.json({
      message: 'Analysis completed',
      analyses,
      summary,
      results,
    }, { status: 201 });
  } catch (error) {
    console.error('Run analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
