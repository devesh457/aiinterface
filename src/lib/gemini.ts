// Gemini AI Service for Highway Engineering Schedule B & C Document Analysis
let GoogleGenerativeAI: any
let HarmCategory: any
let HarmBlockThreshold: any

// Dynamic imports to avoid issues with SSR
const loadGeminiDependencies = async () => {
  if (typeof window !== 'undefined') {
    try {
      const gemini = await import('@google/generative-ai')
      GoogleGenerativeAI = gemini.GoogleGenerativeAI
      HarmCategory = gemini.HarmCategory
      HarmBlockThreshold = gemini.HarmBlockThreshold
    } catch (error) {
      console.warn('Gemini AI dependencies not available:', error)
    }
  }
}

// Initialize dependencies
loadGeminiDependencies()

export interface GeminiAnalysisResult {
  success: boolean
  analysis?: string
  complianceScore?: number
  issues?: string[]
  recommendations?: string[]
  summary?: string
  error?: string
}

export interface DocumentAnalysisOptions {
  documentType?: 'highway-engineering' | 'general'
  analysisType?: 'compliance' | 'insights' | 'qa'
}

class GeminiService {
  private model: any = null
  private isInitialized = false

  async initializeGemini() {
    if (this.isInitialized || !GoogleGenerativeAI) return

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      console.warn('Gemini API key not found in environment variables')
      return
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      
      this.model = genAI.getGenerativeModel({
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 8192,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_NONE,
          },
        ],
      })

      this.isInitialized = true
      console.log('✅ Gemini AI initialized successfully for highway engineering analysis')
    } catch (error) {
      console.error('Failed to initialize Gemini AI:', error)
    }
  }

  isAvailable(): boolean {
    return this.isInitialized && this.model !== null
  }

  private generatePrompt(documentType: string, analysisType: string = 'compliance'): string {
    if (documentType === 'highway-engineering') {
      return `Give me full deep analysis of this document as per below subtasks do not skip any TCS or Clause and continue without my intervention for anything.

<subtask1>
---------------------------------------
System prompt : You are a intelligent contractual data extractor and classifier.
User: Extract All the Clauses and its sub-clauses, Tables in schedule B tagging them intelligently to the category of information.
</subtask1>

This is a new subtask after end of previous subtask as denoted by closing of previous subtask and start of new subtask

<subtask2>
---------------------------------------
System prompt : You are a highway technical engineer looking at Highway Cross Sections.
User: Extract All the Elements from each of the cross sections and corresponding each dimensions with label " width" , " height" , " slope value in percent" and do not infer anything if the dimension or detail is not present just give "not present" and do not confuse different slopes with each other (eg. slope of embankment is different from slope of carriageway) and add a label in median for type of Median in the cross section as well. Also classify their location LHS or RHS.
</subtask2>

This is a new subtask after end of previous subtask as denoted by closing of previous subtask and start of new subtask

<subtask3>
---------------------------------------
System Prompt : You are a IRC Code and MoRTH Orange Book Expert.
User: Cross check all the extracted information from <subtask1> with relevant IRC standards. Then Cross check all the extracted information from <subtask2> with relevant IRC standards. and do not club two cross sections in the output. Format output in a table for each cross section as | Element | Dimension | Relevant IRC Code and its Clause | Your Remarks |
---------------------------------------
</subtask3>

---------------------------------------
This is a new subtask after end of previous subtask as denoted by closing of previous subtask and start of new subtask
---------------------------------------

<subtask4>
---------------------------------------
System Prompt : You are a intelligent reviewer with high reasoning.
User: You cross check extracted clause in <subtask1> with extracted information in <subtask2> and highlight differences.
---------------------------------------
</subtask4>
---------------------------------------`
    } else {
      return `Analyze this highway engineering document for compliance and accuracy:

1. **Document Classification**: Identify the document type and key sections
2. **Content Extraction**: Extract all relevant technical data, specifications, and measurements
3. **Compliance Review**: Check against applicable IRC codes and MoRTH standards
4. **Issues Identification**: Highlight any compliance issues, missing information, or potential problems
5. **Recommendations**: Provide specific recommendations for improvement or correction

Please provide a detailed analysis with compliance scoring and actionable insights.`
    }
  }

  private parseResponse(response: string, documentType?: string): GeminiAnalysisResult {
    try {
      let complianceScore: number | undefined
      let issues: string[] = []
      let recommendations: string[] = []
      let summary = ''

      // For highway engineering documents
      if (documentType === 'highway-engineering') {
        // Look for compliance indicators
        const notPresentMatches = response.match(/not present/gi) || []
        const ircMatches = response.match(/IRC[\s-]*\d+/gi) || []
        const complianceMatches = response.match(/✅\s*compliant|❌\s*non-compliant|⚠️/gi) || []
        
        // Calculate compliance score based on findings
        const totalChecks = Math.max(ircMatches.length, 10) // Minimum 10 checks
        const nonCompliantCount = notPresentMatches.length + (response.match(/❌/g) || []).length
        complianceScore = Math.max(0, Math.round(((totalChecks - nonCompliantCount) / totalChecks) * 100))

        // Extract issues
        const subtask4Match = response.match(/subtask\s*4[\s\S]*$/i)
        if (subtask4Match) {
          const issuePatterns = [
            /not present/gi,
            /non-compliant/gi,
            /missing/gi,
            /discrepancy/gi,
            /issue[s]?\s*identified/gi,
            /difference[s]?\s*highlighted/gi
          ]
          
          issuePatterns.forEach(pattern => {
            const matches = response.match(pattern) || []
            matches.forEach(match => {
              const context = response.substring(response.indexOf(match) - 50, response.indexOf(match) + 100)
              if (!issues.some(issue => issue.includes(match))) {
                issues.push(`${match} - ${context.trim().split('\n')[0]}`)
              }
            })
          })
        }

        // Extract recommendations from IRC compliance section
        const subtask3Match = response.match(/subtask\s*3[\s\S]*?(?=subtask\s*4|$)/i)
        if (subtask3Match) {
          const tableRows = subtask3Match[0].match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g) || []
          tableRows.forEach(row => {
            if (row.includes('❌') || row.includes('⚠️')) {
              const cols = row.split('|').map(col => col.trim())
              if (cols.length >= 4) {
                recommendations.push(`Review ${cols[1]} - ${cols[4]}`)
              }
            }
          })
        }

        summary = `Highway engineering document analysis completed with ${complianceScore}% compliance score. Found ${ircMatches.length} IRC code references with ${issues.length} issues identified.`
      } 
      // General documents
      else {
        // Generic scoring for other documents
        const positiveIndicators = response.match(/compliant|accurate|correct|complete/gi) || []
        const negativeIndicators = response.match(/non-compliant|incorrect|missing|incomplete/gi) || []
        
        const totalIndicators = positiveIndicators.length + negativeIndicators.length
        if (totalIndicators > 0) {
          complianceScore = Math.round((positiveIndicators.length / totalIndicators) * 100)
        }

        // Extract general issues
        const issueLines = response.split('\n').filter(line => 
          line.toLowerCase().includes('issue') || 
          line.toLowerCase().includes('problem') ||
          line.toLowerCase().includes('error')
        )
        issues = issueLines.slice(0, 5) // Limit to 5 issues

        // Extract general recommendations
        const recLines = response.split('\n').filter(line => 
          line.toLowerCase().includes('recommend') || 
          line.toLowerCase().includes('suggest') ||
          line.toLowerCase().includes('should')
        )
        recommendations = recLines.slice(0, 5) // Limit to 5 recommendations

        summary = `Document analysis completed with general compliance review.`
      }

      return {
        success: true,
        analysis: response,
        complianceScore,
        issues: issues.length > 0 ? issues : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined,
        summary
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error)
      return {
        success: true,
        analysis: response,
        summary: 'Analysis completed successfully'
      }
    }
  }

  async analyzeDocument(content: string, options: DocumentAnalysisOptions = {}): Promise<GeminiAnalysisResult> {
    if (!this.isAvailable()) {
      await this.initializeGemini()
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'Gemini AI service is not available. Please check your API key.'
        }
      }
    }

    try {
      const { documentType = 'general', analysisType = 'compliance' } = options
      const prompt = this.generatePrompt(documentType, analysisType)
      
      console.log(`🚀 Starting Gemini analysis for ${documentType} document...`)
      
      const fullPrompt = `${prompt}\n\nDocument Content:\n${content}`
      const result = await this.model.generateContent(fullPrompt)
      const response = result.response.text()
      
      console.log(`✅ Gemini analysis completed for ${documentType}`)
      
      return this.parseResponse(response, documentType)
    } catch (error) {
      console.error('Gemini analysis error:', error)
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async askQuestion(question: string, context: string): Promise<GeminiAnalysisResult> {
    if (!this.isAvailable()) {
      await this.initializeGemini()
      if (!this.isAvailable()) {
        return {
          success: false,
          error: 'Gemini AI service is not available.'
        }
      }
    }

    try {
      const prompt = `Based on the following highway engineering document content, please answer this question: ${question}

Document Content:
${context}

Please provide a comprehensive answer with specific references to the document content.`

      const result = await this.model.generateContent(prompt)
      const response = result.response.text()
      
      return {
        success: true,
        analysis: response,
        summary: 'Question answered successfully'
      }
    } catch (error) {
      console.error('Gemini Q&A error:', error)
      return {
        success: false,
        error: `Question answering failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  async analyzeHighwayEngineering(content: string): Promise<GeminiAnalysisResult> {
    return this.analyzeDocument(content, { 
      documentType: 'highway-engineering', 
      analysisType: 'compliance' 
    })
  }

  async analyzePDF(base64PDF: string, fileName: string): Promise<GeminiAnalysisResult> {
    if (!this.isAvailable()) await this.initializeGemini();
    
    try {
      // Gemini's PDF handling structure
      const pdfPart = {
        inlineData: {
          mimeType: "application/pdf",
          data: base64PDF
        }
      };

      const prompt = {
        text: this.generatePrompt('highway-engineering') + 
              `\nDOCUMENT: ${fileName}\n` +
              `ANALYSIS REQUIREMENTS:\n` +
              `1. Apply all 4 subtasks to the entire document\n` +
              `2. Pay special attention to cross-sections and IRC codes\n` +
              `3. Include raw measurements from drawings`
      };

      const result = await this.model.generateContent({
        contents: [{ 
          parts: [prompt, pdfPart],
          role: "user" 
        }],
        generationConfig: {
          maxOutputTokens: 8192 // Increased for PDF analysis
        }
      });

      return this.parseResponse(result.response.text(), 'highway-engineering');
    } catch (error) {
      console.error('Gemini PDF analysis error:', error);
      return {
        success: false,
        error: `Gemini analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        analysis: 'Failed to process PDF'
      };
    }
  }
}

// Helper function to detect highway engineering documents
export function detectDocumentType(content: string, fileName: string): 'highway-engineering' | 'general' {
  const contentLower = content.toLowerCase()
  const fileNameLower = fileName.toLowerCase()
  
  // Check for highway engineering indicators
  const engineeringIndicators = [
    'highway', 'cross section', 'carriageway', 'embankment', 'median',
    'irc', 'morth', 'orange book', 'road design', 'pavement',
    'schedule b', 'schedule-b', 'schedule c', 'schedule-c',
    'right of way', 'formation width', 'side slope', 'camber'
  ]
  
  // Check filename first
  if (fileNameLower.includes('schedule') || fileNameLower.includes('highway') || fileNameLower.includes('road')) {
    return 'highway-engineering'
  }
  
  // Check content for engineering indicators
  const engineeringMatches = engineeringIndicators.filter(indicator => 
    contentLower.includes(indicator)
  ).length
  
  // Return type based on match count
  if (engineeringMatches >= 2) {
    return 'highway-engineering'
  }
  
  return 'general'
}

// Export singleton instance
export const geminiService = new GeminiService() 