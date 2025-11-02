import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { fileHandler } from '@/lib/file-handler';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId, files } = body;

    if (!projectId || !files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Project ID and files array are required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.userId,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const uploadedFiles = [];

    for (const fileData of files) {
      const { path, content } = fileData;

      if (!path || content === undefined) {
        continue;
      }

      if (fileHandler.shouldIgnore(path) || !fileHandler.isTextFile(path)) {
        continue;
      }

      const language = fileHandler.detectLanguage(path);
      const size = Buffer.byteLength(content, 'utf-8');

      await fileHandler.saveFile(projectId, path, content);

      const file = await prisma.file.upsert({
        where: {
          projectId_path: {
            projectId,
            path,
          },
        },
        update: {
          content,
          size,
          language,
        },
        create: {
          projectId,
          path,
          content,
          language,
          size,
        },
      });

      uploadedFiles.push(file);
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      count: uploadedFiles.length,
    }, { status: 201 });
  } catch (error) {
    console.error('Upload files error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
