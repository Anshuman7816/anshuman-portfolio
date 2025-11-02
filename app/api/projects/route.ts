import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user'
    
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        _count: {
          select: { files: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.createdAt,
        fileCount: p._count.files
      }))
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id') || 'demo-user'
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      )
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: `${userId}@demo.com`,
          name: 'Demo User',
          password: 'demo'
        }
      })
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        userId
      }
    })

    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt
      }
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
