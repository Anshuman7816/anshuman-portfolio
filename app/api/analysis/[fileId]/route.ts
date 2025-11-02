import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const analyses = await prisma.analysis.findMany({
      where: {
        fileId: fileId,
        file: {
          project: {
            userId: user.userId,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedAnalyses = analyses.map((analysis) => ({
      ...analysis,
      results: JSON.parse(analysis.results),
    }));

    return NextResponse.json({ analyses: parsedAnalyses });
  } catch (error) {
    console.error('Get analyses error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
