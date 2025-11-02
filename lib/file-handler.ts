import { promises as fs } from 'fs'
import path from 'path'

export class FileHandler {
  private static uploadDir = process.env.UPLOAD_DIR || './uploads'

  static async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
    }
  }

  static async saveFile(projectId: string, filePath: string, content: string): Promise<string> {
    await this.ensureUploadDir()
    
    const projectDir = path.join(this.uploadDir, projectId)
    await fs.mkdir(projectDir, { recursive: true })
    
    const fullPath = path.join(projectDir, filePath)
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })
    
    await fs.writeFile(fullPath, content, 'utf-8')
    return fullPath
  }

  static async readFile(projectId: string, filePath: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, projectId, filePath)
    return await fs.readFile(fullPath, 'utf-8')
  }

  static async deleteProject(projectId: string): Promise<void> {
    const projectDir = path.join(this.uploadDir, projectId)
    try {
      await fs.rm(projectDir, { recursive: true, force: true })
    } catch (error) {
      console.error('Error deleting project files:', error)
    }
  }

  static getFileLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase()
    const languageMap: Record<string, string> = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cs': 'csharp',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.rb': 'ruby',
      '.swift': 'swift',
      '.kt': 'kotlin',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
    }
    return languageMap[ext] || 'plaintext'
  }

  static shouldAnalyzeFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase()
    const analyzableExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.html', '.css',
    ]
    return analyzableExtensions.includes(ext)
  }

  static async getProjectFiles(projectId: string): Promise<string[]> {
    const projectDir = path.join(this.uploadDir, projectId)
    const files: string[] = []

    async function scanDir(dir: string, baseDir: string): Promise<void> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true })
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name)
          const relativePath = path.relative(baseDir, fullPath)
          
          if (entry.isDirectory()) {
            await scanDir(fullPath, baseDir)
          } else {
            files.push(relativePath)
          }
        }
      } catch (error) {
        console.error('Error scanning directory:', error)
      }
    }

    await scanDir(projectDir, projectDir)
    return files
  }
}
