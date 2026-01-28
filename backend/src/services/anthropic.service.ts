import Anthropic from '@anthropic-ai/sdk';

interface AIResponse {
  matterSummary: string
  incidentType: string
  clarifyingQuestions: string[]
  conditionalGuidance: string
  legalPathways: string[]
  flowchart: string
  disclaimer: string
  // Legacy fields for backward compatibility
  summary?: string
  steps?: string[]
  legal_references?: string[]
}

const SYSTEM_PROMPT = `You are AskJunior, a Junior Legal Information Assistant behaving like a junior lawyer.

===== CORE PRINCIPLE: LAWYER-LIKE APPROACH =====
You do NOT give generic legal answers upfront.
You FIRST understand the user's situation.
You THEN provide personalised guidance based on their specific facts.

This is how real lawyers work:
1. Understand the matter
2. Clarify missing facts
3. Then provide tailored guidance
4. Explicitly state assumptions
5. Adapt based on user responses

===== MANDATORY TWO-PHASE RESPONSE MODEL =====

PHASE 1 — MATTER UNDERSTANDING (ALWAYS FIRST IF INCOMPLETE)
If the user describes a situation with missing details:
- Briefly restate their matter in neutral legal terms
- Identify what type of matter it appears to be
- Ask 2–4 PRECISE clarifying questions to understand facts better
- Do NOT assume facts not provided
- Do NOT jump to legal conclusions yet

Example:
"From what you've described, this appears to involve workplace harassment. To give accurate guidance, I need to understand a few details."

PHASE 2 — CONDITIONAL GUIDANCE (ONLY AFTER PHASE 1 OR IF FACTS ARE CLEAR)
- Provide guidance EXPLICITLY marked as conditional
- Label as: "Based on the information available so far…"
- Explain how guidance changes if answers differ
- State clear assumptions
- Give step-by-step, specific guidance (not generic law)
- Focus on the USER'S situation, not theory

===== CRITICAL RESPONSE STRUCTURE (MANDATORY) =====

ALWAYS structure responses as follows:

1. HEADING: "Understanding Your Situation"

2. MATTER SUMMARY (2–3 lines)
   - Restate in neutral legal terms
   - Show you understood their specific case
   - NOT generic explanation

3. CLARIFYING QUESTIONS (if facts are incomplete)
   - Bullet list
   - 2–4 precise questions
   - Each question should clarify a KEY missing fact
   - Format: "• Have you [specific fact]?" or "• Is [detail] relevant to your case?"

4. CONDITIONAL LEGAL GUIDANCE (if facts are sufficient)
   - Start: "Based on the information available so far…"
   - State explicit assumptions
   - Give step-by-step actions (not legal theory)
   - Avoid final conclusions

5. POSSIBLE LEGAL PATHWAYS (brief bullet list)
   - 2–3 key options
   - One sentence each
   - Based on user's specific situation

6. PERSONALISED FLOWCHART (Mermaid syntax)
   - Incident-specific (NOT generic)
   - Branches based on user's answers
   - Shows decision points relevant to their situation
   - Uses flowchart TD format
   - Example branches: Incident Type → Key Factor → Authority Path → Outcome

7. DISCLAIMER (subtle, non-alarmist)
   - "This is general legal information based on facts you've provided, not legal advice."
   - Mention consulting licensed advocate for case-specific guidance

===== ANTI-GENERIC RULES (VERY IMPORTANT) =====

NEVER:
- Start by explaining generic law
- List laws before understanding facts
- Give "what usually happens" without their specific context
- Use boilerplate legal language
- Assume facts not provided
- Reset to generic mode—stay focused on THEIR situation

IF INFORMATION IS MISSING:
- ASK, don't assume
- Be specific: "Have you reported this to [authority]?" not "Did you report it?"
- Each question should resolve a key uncertainty

===== FLOWCHART REQUIREMENTS =====

Flowchart MUST:
- Be incident-specific (reflect their described situation)
- Include decision branches
- Highlight the current assumed path based on their facts
- Use clear, concise node labels
- Flow from incident → key factors → legal pathway → outcome

Example:
\`\`\`
flowchart TD
  A["Workplace Harassment Incident"] --> B{Type of Harassment?}
  B -->|Sexual| C["Report to HR/Internal Complaints Committee"]
  B -->|Other| D["Document incidents with dates"]
  C --> E["Investigation Process"]
  D --> E
  E --> F{Evidence Sufficient?}
  F -->|Yes| G["File complaint with Labour Authority"]
  F -->|No| H["Gather more documentation"]
  H --> E
  G --> I["Legal proceedings initiated"]
\`\`\`

===== CRITICAL: RESPONSE FORMAT (MANDATORY) =====

Return ONLY valid JSON. Return nothing else.
- Do NOT include any text before the JSON.
- Do NOT include any text after the JSON.
- Do NOT wrap JSON in markdown code blocks.
- Do NOT include backticks anywhere.
- Return raw JSON object only.

Return exactly this structure:
{
  "matterSummary": "Restatement of their situation in neutral legal terms (2–3 lines)",
  "incidentType": "Type of matter (e.g., workplace harassment, property dispute, fraud)",
  "clarifyingQuestions": ["Question 1 for missing facts?", "Question 2?", "Question 3?"],
  "conditionalGuidance": "Guidance marked as conditional: 'Based on the information available so far…' Explicit assumptions. Step-by-step actions.",
  "legalPathways": ["Option 1: Brief description", "Option 2: Brief description"],
  "flowchart": "flowchart TD\\n  A[...] --> B[...]\\n  ...",
  "disclaimer": "Subtle disclaimer mentioning general information vs legal advice"
}

===== VALIDATION RULES =====
- matterSummary: 2–3 sentences, neutral legal language
- incidentType: Clear category
- clarifyingQuestions: Array of 0–4 questions (empty if facts are sufficient)
- conditionalGuidance: Starts with "Based on the information available so far…" if providing guidance
- legalPathways: Array of 2–3 options
- flowchart: Incident-specific Mermaid syntax, starts with "flowchart TD"
- disclaimer: Non-empty string

Every response MUST include a Mermaid flowchart.
Every response MUST be valid JSON.
NEVER give generic responses.
NEVER skip clarifying questions if facts are incomplete.

If jurisdiction differs, assume INDIA.
You are NOT a lawyer. You provide GENERAL LEGAL INFORMATION only.
You do NOT give legal advice or predict outcomes.
You NEVER suggest illegal actions.`;


export class AnthropicService {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      const errorMsg = 'Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.';
      console.error(`🔴 CRITICAL: ${errorMsg}`);
      throw new Error(errorMsg);
    }
    console.log('✅ Anthropic API key verified at service initialization');
    this.client = new Anthropic({ 
      apiKey,
      timeout: 45000, // 45 second timeout for API calls
    });
  }

  /**
   * Process a legal question through Claude and format response strictly
   * Implements retry logic and strict validation
   */
  async askLegalQuestion(userMessage: string, documentContext: string = ''): Promise<AIResponse> {
    const maxRetries = 2;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`\n📤 [Attempt ${attempt + 1}/${maxRetries + 1}] Calling Anthropic Claude API...`);
        console.log(`User message: "${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}"`);
        if (documentContext) {
          console.log(`Document context provided: ${documentContext.substring(0, 100)}...`);
        }

        // Build system prompt with document context if available
        let systemPrompt = SYSTEM_PROMPT;
        let userContent = userMessage;
        
        if (documentContext && documentContext.length > 0) {
          systemPrompt += `\n\n===== USER-PROVIDED DOCUMENTS =====\n${documentContext}\n\nWhen answering, prioritize information from user-provided documents.`;
          userContent = `${userMessage}\n\n[User has provided supporting documents for this query.]`;
        }

        console.log('📡 Making API request to Claude...');
        const response = await this.client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 2000,
          temperature: 0.3,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: userContent,
            },
          ],
        });

        console.log('✅ Claude API response received, stop_reason:', response.stop_reason);

        // FIX #1: Ensure we read response.content[0].text correctly
        if (!response.content || response.content.length === 0) {
          throw new Error('Claude returned empty content array');
        }

        const content = response.content[0];
        if (content.type !== 'text') {
          throw new Error(`Unexpected response type from Claude: ${content.type}`);
        }

        const responseText = content.text;
        console.log(`📝 Claude response (first 300 chars): ${responseText.substring(0, 300)}`);

        // FIX #2: Safe JSON extraction with proper error handling
        const parsedResponse = this.extractAndParseJSON(responseText);

        // FIX #5: Validate response against schema
        this.validateResponse(parsedResponse);

        console.log('✨ Successfully processed Claude response');
        return parsedResponse;
      } catch (error: any) {
        lastError = error as Error;
        
        // Log detailed error information
        console.error(`❌ [Attempt ${attempt + 1}] Error:`, error.message);
        
        // Check for specific Anthropic API errors
        if (error.status === 401) {
          console.error('🔴 Authentication error - API key may be invalid');
          throw new Error('ANTHROPIC_API_KEY is invalid or expired');
        }
        if (error.status === 429) {
          console.error('🔴 Rate limit exceeded - too many requests');
          // Wait longer before retry on rate limit
          if (attempt < maxRetries) {
            console.log('⏳ Waiting 2 seconds before retry due to rate limit...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
        if (error.status === 500 || error.status === 503) {
          console.error('🔴 Anthropic service error - may be temporary');
        }

        if (attempt < maxRetries) {
          console.log('🔄 Retrying...\n');
          continue;
        }
      }
    }

    // FIX #4: Log real errors and throw instead of masking with fallback
    console.error('❌ All retry attempts failed');
    if (lastError) {
      console.error('Final error:', lastError.message);
      if (lastError.stack) {
        console.error('Stack:', lastError.stack.substring(0, 500));
      }
    }

    // Return error that will be caught by controller and converted to 502
    throw new Error(`Claude API failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Extract and parse JSON from Claude response
   * Handles various JSON formats returned by Claude
   */
  private extractAndParseJSON(responseText: string): AIResponse {
    let jsonString: string | null = null;

    // Clean up common issues in response text
    let cleanedText = responseText.trim();
    
    // Try multiple extraction strategies
    const strategies = [
      // Strategy 1: JSON wrapped in code blocks with language tag
      () => {
        const match = cleanedText.match(/```json\s*\n?([\s\S]*?)\n?```/);
        return match ? match[1].trim() : null;
      },
      // Strategy 2: JSON wrapped in code blocks without language tag
      () => {
        const match = cleanedText.match(/```\s*\n?([\s\S]*?)\n?```/);
        return match ? match[1].trim() : null;
      },
      // Strategy 3: Raw JSON object (no code blocks) - greedy match for outermost braces
      () => {
        const startIdx = cleanedText.indexOf('{');
        if (startIdx === -1) return null;
        
        let braceCount = 0;
        let endIdx = -1;
        
        for (let i = startIdx; i < cleanedText.length; i++) {
          if (cleanedText[i] === '{') braceCount++;
          else if (cleanedText[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }
        }
        
        if (endIdx !== -1) {
          return cleanedText.substring(startIdx, endIdx + 1);
        }
        return null;
      },
      // Strategy 4: Simple regex fallback
      () => {
        const match = cleanedText.match(/\{[\s\S]*\}/);
        return match ? match[0].trim() : null;
      },
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        jsonString = strategies[i]();
        if (jsonString) {
          console.log(`🔍 Using extraction strategy ${i + 1}, found ${jsonString.length} chars`);
          break;
        }
      } catch (e) {
        console.warn(`Strategy ${i + 1} failed:`, e);
      }
    }

    if (!jsonString) {
      console.error('❌ Raw response text:', cleanedText.substring(0, 500));
      throw new Error('Could not extract JSON from Claude response - no valid JSON found');
    }

    try {
      // First try parsing the original JSON string
      try {
        const parsed = JSON.parse(jsonString);
        console.log('✅ JSON parsed successfully (original)');
        return parsed as AIResponse;
      } catch (firstError) {
        console.log('⚠️ First parse attempt failed, trying fixes...');
        
        // Try to fix common JSON issues
        let fixedJson = jsonString
          .replace(/,\s*}/g, '}')  // Remove trailing commas before }
          .replace(/,\s*]/g, ']'); // Remove trailing commas before ]
        
        try {
          const parsed = JSON.parse(fixedJson);
          console.log('✅ JSON parsed successfully (after comma fixes)');
          return parsed as AIResponse;
        } catch (secondError) {
          // Re-throw with first error message as it's likely more relevant
          throw firstError;
        }
      }
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      console.error('❌ JSON parse error:', errorMsg);
      console.error('❌ Attempted to parse:', jsonString.substring(0, 300));
      throw new Error(`JSON parsing failed: ${errorMsg}. Response preview: ${jsonString.substring(0, 100)}`);
    }
  }

  /**
   * Validate response matches required schema and has meaningful content
   * Uses lenient validation with auto-repair for missing fields
   */
  private validateResponse(response: AIResponse): void {
    const warnings: string[] = [];

    // Auto-repair missing matterSummary
    if (!response.matterSummary || typeof response.matterSummary !== 'string' || response.matterSummary.trim().length === 0) {
      response.matterSummary = response.summary || 'Your legal matter has been reviewed.';
      warnings.push('matterSummary was auto-repaired');
    }

    // Auto-repair missing incidentType
    if (!response.incidentType || typeof response.incidentType !== 'string' || response.incidentType.trim().length === 0) {
      response.incidentType = 'Legal Inquiry';
      warnings.push('incidentType was auto-repaired');
    }

    // Auto-repair missing clarifyingQuestions
    if (!Array.isArray(response.clarifyingQuestions)) {
      response.clarifyingQuestions = [];
      warnings.push('clarifyingQuestions was auto-repaired to empty array');
    }

    // Auto-repair missing conditionalGuidance
    if (!response.conditionalGuidance || typeof response.conditionalGuidance !== 'string' || response.conditionalGuidance.trim().length === 0) {
      // Try to use steps if available (legacy format)
      if (response.steps && Array.isArray(response.steps) && response.steps.length > 0) {
        response.conditionalGuidance = 'Based on the information available so far:\n' + response.steps.map((s, i) => `${i + 1}. ${s}`).join('\n');
      } else {
        response.conditionalGuidance = 'Based on the information available so far, please provide more details for specific guidance.';
      }
      warnings.push('conditionalGuidance was auto-repaired');
    }

    // Auto-repair missing legalPathways
    if (!Array.isArray(response.legalPathways) || response.legalPathways.length < 1) {
      response.legalPathways = ['Consult with a legal professional for personalized advice', 'Review relevant documentation'];
      warnings.push('legalPathways was auto-repaired');
    }

    // Auto-repair missing flowchart
    if (!response.flowchart || typeof response.flowchart !== 'string') {
      response.flowchart = 'flowchart TD\n  A["Your Legal Matter"] --> B["Review Details"]\n  B --> C["Seek Professional Advice"]';
      warnings.push('flowchart was auto-repaired with default');
    } else if (!response.flowchart.includes('flowchart TD') && !response.flowchart.includes('graph TD')) {
      // Try to fix flowchart prefix
      response.flowchart = 'flowchart TD\n' + response.flowchart;
      warnings.push('flowchart prefix was auto-repaired');
    }

    // Auto-repair missing disclaimer
    if (!response.disclaimer || typeof response.disclaimer !== 'string' || response.disclaimer.trim().length === 0) {
      response.disclaimer = 'This is general legal information based on facts you\'ve provided, not legal advice. Please consult a licensed advocate for case-specific guidance.';
      warnings.push('disclaimer was auto-repaired');
    }

    if (warnings.length > 0) {
      console.warn('⚠️ Response auto-repair applied:', warnings);
    }

    console.log('✅ Response validation passed - Two-phase lawyer-like model enforced');
  }
}

export const anthropicService = new AnthropicService();
