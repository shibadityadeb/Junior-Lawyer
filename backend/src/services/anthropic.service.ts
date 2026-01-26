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
    this.client = new Anthropic({ apiKey });
  }

  /**
   * Process a legal question through Claude and format response strictly
   * Implements retry logic and strict validation
   */
  async askLegalQuestion(userMessage: string): Promise<AIResponse> {
    const maxRetries = 1;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`\n📤 [Attempt ${attempt + 1}/${maxRetries + 1}] Calling Anthropic Claude API...`);
        console.log(`User message: "${userMessage}"`);

        const response = await this.client.messages.create({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 700,
          temperature: 0.3,
          system: SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: userMessage,
            },
          ],
        });

        console.log('✅ Claude API response received');

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
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ [Attempt ${attempt + 1}] Error:`, (error as Error).message);

        if (attempt < maxRetries) {
          console.log('🔄 Retrying...\n');
          continue; // FIX #3: Retry once
        }
      }
    }

    // FIX #4: Log real errors and throw instead of masking with fallback
    console.error('❌ All retry attempts failed');
    if (lastError) {
      console.error('Final error:', lastError.message);
      console.error('Stack:', lastError.stack);
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

    // Try multiple extraction strategies
    const strategies = [
      // Strategy 1: JSON wrapped in code blocks with language tag
      () => {
        const match = responseText.match(/```json\s*\n?([\s\S]*?)\n?```/);
        return match ? match[1].trim() : null;
      },
      // Strategy 2: JSON wrapped in code blocks without language tag
      () => {
        const match = responseText.match(/```\s*\n?([\s\S]*?)\n?```/);
        return match ? match[1].trim() : null;
      },
      // Strategy 3: Raw JSON object (no code blocks)
      () => {
        const match = responseText.match(/\{[\s\S]*\}/);
        return match ? match[0].trim() : null;
      },
    ];

    for (const strategy of strategies) {
      jsonString = strategy();
      if (jsonString) {
        console.log(`🔍 Using extraction strategy, found ${jsonString.length} chars`);
        break;
      }
    }

    if (!jsonString) {
      throw new Error('Could not extract JSON from Claude response - no valid JSON found');
    }

    try {
      const parsed = JSON.parse(jsonString);
      console.log('✅ JSON parsed successfully');
      return parsed as AIResponse;
    } catch (parseError) {
      const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parse error';
      throw new Error(`JSON parsing failed: ${errorMsg}. Response: ${jsonString.substring(0, 100)}`);
    }
  }

  /**
   * Validate response matches required schema and has meaningful content
   */
  private validateResponse(response: AIResponse): void {
    const errors: string[] = [];

    // Validate matterSummary (NEW - MANDATORY)
    if (!response.matterSummary || typeof response.matterSummary !== 'string' || response.matterSummary.trim().length === 0) {
      errors.push('matterSummary must be a non-empty string');
    }

    // Validate incidentType (NEW - MANDATORY)
    if (!response.incidentType || typeof response.incidentType !== 'string' || response.incidentType.trim().length === 0) {
      errors.push('incidentType must be a non-empty string');
    }

    // Validate clarifyingQuestions (NEW - can be empty array)
    if (!Array.isArray(response.clarifyingQuestions)) {
      errors.push('clarifyingQuestions must be an array');
    } else if (response.clarifyingQuestions.length > 4) {
      errors.push('clarifyingQuestions must have at most 4 questions');
    }

    // Validate conditionalGuidance (NEW - MANDATORY)
    if (!response.conditionalGuidance || typeof response.conditionalGuidance !== 'string' || response.conditionalGuidance.trim().length === 0) {
      errors.push('conditionalGuidance must be a non-empty string');
    }

    // Validate legalPathways (NEW - MANDATORY)
    if (!Array.isArray(response.legalPathways) || response.legalPathways.length < 2) {
      errors.push('legalPathways must be an array with at least 2 elements');
    }

    // Validate flowchart (CRITICAL - UNCHANGED)
    if (!response.flowchart || typeof response.flowchart !== 'string') {
      errors.push('flowchart must be a non-empty string');
    } else if (!response.flowchart.includes('flowchart TD') && !response.flowchart.includes('graph TD')) {
      errors.push('flowchart must contain "flowchart TD" or "graph TD"');
    }

    // Validate disclaimer (UNCHANGED)
    if (!response.disclaimer || typeof response.disclaimer !== 'string' || response.disclaimer.trim().length === 0) {
      errors.push('disclaimer must be a non-empty string');
    }

    if (errors.length > 0) {
      console.error('❌ Response validation failed:', errors);
      throw new Error(`Response validation failed: ${errors.join('; ')}`);
    }

    console.log('✅ Response validation passed - Two-phase lawyer-like model enforced');
  }
}

export const anthropicService = new AnthropicService();
