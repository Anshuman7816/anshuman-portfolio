export interface AnalysisResult {
  type: 'bug' | 'security' | 'performance' | 'quality' | 'documentation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  line?: number;
  column?: number;
  message: string;
  suggestion?: string;
  code?: string;
}

export interface FileAnalysis {
  fileId: string;
  fileName: string;
  language: string;
  results: AnalysisResult[];
  summary: {
    totalIssues: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export class AIAnalyzer {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
  }

  async analyzeCode(
    code: string,
    language: string,
    analysisTypes: string[] = ['bug', 'security', 'performance', 'quality']
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    for (const type of analysisTypes) {
      const typeResults = await this.runAnalysis(code, language, type);
      results.push(...typeResults);
    }

    return results;
  }

  private async runAnalysis(
    code: string,
    language: string,
    type: string
  ): Promise<AnalysisResult[]> {
    // If no API key, use mock analysis
    if (!this.apiKey || this.apiKey === 'your_openai_api_key_here') {
      return this.mockAnalysis(code, language, type);
    }

    try {
      const prompt = this.buildPrompt(code, language, type);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert code reviewer specializing in ${type} analysis. Analyze the code and return results in JSON format.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        console.error('OpenAI API error:', await response.text());
        return this.mockAnalysis(code, language, type);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '[]';
      
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return this.mockAnalysis(code, language, type);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      return this.mockAnalysis(code, language, type);
    }
  }

  private buildPrompt(code: string, language: string, type: string): string {
    const prompts: Record<string, string> = {
      bug: `Analyze this ${language} code for potential bugs, logic errors, and runtime issues. Return a JSON array of issues with: type, severity, line, message, suggestion.`,
      security: `Analyze this ${language} code for security vulnerabilities like SQL injection, XSS, authentication issues, etc. Return a JSON array of issues.`,
      performance: `Analyze this ${language} code for performance issues, inefficient algorithms, memory leaks, etc. Return a JSON array of issues.`,
      quality: `Analyze this ${language} code for code quality issues, best practices violations, code smells, etc. Return a JSON array of issues.`,
      documentation: `Analyze this ${language} code for missing or inadequate documentation. Return a JSON array of suggestions.`,
    };

    return `${prompts[type] || prompts.bug}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``;
  }

  private mockAnalysis(code: string, language: string, type: string): AnalysisResult[] {
    const lines = code.split('\n');
    const results: AnalysisResult[] = [];

    // Mock analysis based on simple heuristics
    switch (type) {
      case 'bug':
        // Check for common bug patterns
        lines.forEach((line, index) => {
          if (line.includes('==') && !line.includes('===')) {
            results.push({
              type: 'bug',
              severity: 'medium',
              line: index + 1,
              message: 'Use strict equality (===) instead of loose equality (==)',
              suggestion: 'Replace == with === for type-safe comparison',
              code: line.trim(),
            });
          }
          if (line.includes('var ')) {
            results.push({
              type: 'bug',
              severity: 'low',
              line: index + 1,
              message: 'Avoid using var, use let or const instead',
              suggestion: 'Replace var with let or const for better scoping',
              code: line.trim(),
            });
          }
        });
        break;

      case 'security':
        lines.forEach((line, index) => {
          if (line.includes('eval(') || line.includes('innerHTML')) {
            results.push({
              type: 'security',
              severity: 'high',
              line: index + 1,
              message: 'Potential XSS vulnerability detected',
              suggestion: 'Avoid using eval() or innerHTML with user input',
              code: line.trim(),
            });
          }
          if (line.includes('password') && line.includes('console.log')) {
            results.push({
              type: 'security',
              severity: 'critical',
              line: index + 1,
              message: 'Sensitive information logged to console',
              suggestion: 'Remove console.log statements containing passwords',
              code: line.trim(),
            });
          }
        });
        break;

      case 'performance':
        lines.forEach((line, index) => {
          if (line.includes('for') && line.includes('.length')) {
            results.push({
              type: 'performance',
              severity: 'low',
              line: index + 1,
              message: 'Cache array length in loop condition',
              suggestion: 'Store array.length in a variable before the loop',
              code: line.trim(),
            });
          }
        });
        break;

      case 'quality':
        lines.forEach((line, index) => {
          if (line.length > 120) {
            results.push({
              type: 'quality',
              severity: 'low',
              line: index + 1,
              message: 'Line too long (exceeds 120 characters)',
              suggestion: 'Break long lines into multiple lines for better readability',
            });
          }
          if (line.includes('TODO') || line.includes('FIXME')) {
            results.push({
              type: 'quality',
              severity: 'medium',
              line: index + 1,
              message: 'Unresolved TODO/FIXME comment',
              suggestion: 'Address the TODO/FIXME or create a task to track it',
              code: line.trim(),
            });
          }
        });
        break;

      case 'documentation':
        // Check for functions without comments
        lines.forEach((line, index) => {
          if (
            (line.includes('function ') || line.includes('const ') && line.includes('=>')) &&
            (index === 0 || !lines[index - 1].trim().startsWith('//'))
          ) {
            results.push({
              type: 'documentation',
              severity: 'low',
              line: index + 1,
              message: 'Function lacks documentation',
              suggestion: 'Add JSDoc comment describing parameters and return value',
              code: line.trim(),
            });
          }
        });
        break;
    }

    return results;
  }

  calculateSummary(results: AnalysisResult[]) {
    return {
      totalIssues: results.length,
      critical: results.filter((r) => r.severity === 'critical').length,
      high: results.filter((r) => r.severity === 'high').length,
      medium: results.filter((r) => r.severity === 'medium').length,
      low: results.filter((r) => r.severity === 'low').length,
    };
  }
}

export const aiAnalyzer = new AIAnalyzer();
