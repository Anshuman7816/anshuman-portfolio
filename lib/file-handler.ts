import { promises as fs } from 'fs';
import path from 'path';

export interface FileInfo {
  path: string;
  content: string;
  size: number;
  language: string;
}

export class FileHandler {
  private uploadDir: string;

  constructor(uploadDir: string = './uploads') {
    this.uploadDir = uploadDir;
  }

  async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(projectId: string, filePath: string, content: string): Promise<string> {
    await this.ensureUploadDir();
    
    const projectDir = path.join(this.uploadDir, projectId);
    await fs.mkdir(projectDir, { recursive: true });
    
    const fullPath = path.join(projectDir, filePath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(fullPath, content, 'utf-8');
    return fullPath;
  }

  async readFile(projectId: string, filePath: string): Promise<string> {
    const fullPath = path.join(this.uploadDir, projectId, filePath);
    return await fs.readFile(fullPath, 'utf-8');
  }

  async deleteProject(projectId: string): Promise<void> {
    const projectDir = path.join(this.uploadDir, projectId);
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error deleting project directory:', error);
    }
  }

  detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
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
      '.scala': 'scala',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.json': 'json',
      '.xml': 'xml',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.md': 'markdown',
      '.sql': 'sql',
      '.sh': 'bash',
    };
    return languageMap[ext] || 'plaintext';
  }

  isTextFile(filePath: string): boolean {
    const textExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala', '.html',
      '.css', '.scss', '.json', '.xml', '.yaml', '.yml', '.md', '.txt',
      '.sql', '.sh', '.env', '.gitignore', '.dockerignore',
    ];
    const ext = path.extname(filePath).toLowerCase();
    return textExtensions.includes(ext);
  }

  shouldIgnore(filePath: string): boolean {
    const ignoredPatterns = [
      'node_modules',
      '.git',
      '.next',
      'dist',
      'build',
      'coverage',
      '.DS_Store',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
    ];
    return ignoredPatterns.some((pattern) => filePath.includes(pattern));
  }
}

export const fileHandler = new FileHandler();
