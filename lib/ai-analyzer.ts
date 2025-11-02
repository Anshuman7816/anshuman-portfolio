import OpenAI from 'openai'
import { AnalysisResult } from './types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export class AIAnalyzer {
  private static getLanguageFromPath(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: 'JavaScript',
      jsx: 'JavaScript React',
      ts: 'TypeScript',
      tsx: 'TypeScript React',
      py: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      cs: 'C#',
      go: 'Go',
      rs: 'Rust',
      php: 'PHP',
      rb: 'Ruby',
      swift: 'Swift',
      kt: 'Kotlin',
    }
    return languageMap[ext || ''] || 'Unknown'
  }

  static async analyzeBugs(code: string, filePath: string): Promise<AnalysisResult[]> {
    const language = this.getLanguageFromPath(filePath)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert code reviewer specializing in bug detection. Analyze the provided ${language} code and identify potential bugs, logic errors, edge cases, and runtime issues. Return results as a JSON array of objects with: type (always "bug"), severity ("low"|"medium"|"high"|"critical"), line (number), message (description), suggestion (fix recommendation), and code (problematic code snippet).`,
          },
          {
            role: 'user',
            content: `File: ${filePath}\n\nCode:\n${code}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      const parsed = JSON.parse(content)
      return parsed.issues || parsed.results || []
    } catch (error) {
      console.error('Bug analysis error:', error)
      return []
    }
  }

  static async analyzeSecurity(code: string, filePath: string): Promise<AnalysisResult[]> {
    const language = this.getLanguageFromPath(filePath)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a security expert analyzing ${language} code. Identify security vulnerabilities including SQL injection, XSS, CSRF, insecure dependencies, hardcoded secrets, authentication issues, and data exposure. Return results as a JSON array of objects with: type (always "security"), severity ("low"|"medium"|"high"|"critical"), line (number), message (description), suggestion (fix recommendation), and code (vulnerable code snippet).`,
          },
          {
            role: 'user',
            content: `File: ${filePath}\n\nCode:\n${code}`,
          },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      const parsed = JSON.parse(content)
      return parsed.issues || parsed.results || []
    } catch (error) {
      console.error('Security analysis error:', error)
      return []
    }
  }

  static async analyzePerformance(code: string, filePath: string): Promise<AnalysisResult[]> {
    const language = this.getLanguageFromPath(filePath)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a performance optimization expert for ${language}. Identify performance issues including inefficient algorithms, memory leaks, unnecessary computations, blocking operations, and optimization opportunities. Return results as a JSON array of objects with: type (always "performance"), severity ("low"|"medium"|"high"|"critical"), line (number), message (description), suggestion (optimization recommendation), and code (inefficient code snippet).`,
          },
          {
            role: 'user',
            content: `File: ${filePath}\n\nCode:\n${code}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      const parsed = JSON.parse(content)
      return parsed.issues || parsed.results || []
    } catch (error) {
      console.error('Performance analysis error:', error)
      return []
    }
  }

  static async analyzeQuality(code: string, filePath: string): Promise<AnalysisResult[]> {
    const language = this.getLanguageFromPath(filePath)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a code quality expert for ${language}. Identify code smells, violations of best practices, maintainability issues, naming conventions, code duplication, and architectural concerns. Return results as a JSON array of objects with: type (always "quality"), severity ("low"|"medium"|"high"|"critical"), line (number), message (description), suggestion (improvement recommendation), and code (problematic code snippet).`,
          },
          {
            role: 'user',
            content: `File: ${filePath}\n\nCode:\n${code}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      const parsed = JSON.parse(content)
      return parsed.issues || parsed.results || []
    } catch (error) {
      console.error('Quality analysis error:', error)
      return []
    }
  }

  static async analyzeDocumentation(code: string, filePath: string): Promise<AnalysisResult[]> {
    const language = this.getLanguageFromPath(filePath)
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a documentation expert for ${language}. Identify missing or inadequate documentation, unclear function/class descriptions, missing parameter descriptions, and areas needing better comments. Return results as a JSON array of objects with: type (always "documentation"), severity ("low"|"medium"|"high"|"critical"), line (number), message (description), suggestion (documentation recommendation), and code (undocumented code snippet).`,
          },
          {
            role: 'user',
            content: `File: ${filePath}\n\nCode:\n${code}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) return []

      const parsed = JSON.parse(content)
      return parsed.issues || parsed.results || []
    } catch (error) {
      console.error('Documentation analysis error:', error)
      return []
    }
  }

  static async analyzeAll(code: string, filePath: string): Promise<Record<string, AnalysisResult[]>> {
    const [bugs, security, performance, quality, documentation] = await Promise.all([
      this.analyzeBugs(code, filePath),
      this.analyzeSecurity(code, filePath),
      this.analyzePerformance(code, filePath),
      this.analyzeQuality(code, filePath),
      this.analyzeDocumentation(code, filePath),
    ])

    return {
      bug: bugs,
      security,
      performance,
      quality,
      documentation,
    }
  }
}
