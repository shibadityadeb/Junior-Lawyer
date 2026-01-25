import Anthropic from '@anthropic-ai/sdk';

interface AIResponse {
  summary: string;
  steps: string[];
  legal_references: string[];
  flowchart: string;
  disclaimer: string;
}

const SYSTEM_PROMPT = `You are AskJunior, a Junior Legal Information Assistant.

You provide GENERAL LEGAL INFORMATION only.
You are NOT a lawyer.
You do NOT give legal advice or opinions.
You do NOT predict court outcomes.
You NEVER suggest illegal actions.
You ALWAYS recommend consulting a licensed advocate for case-specific or serious legal matters.

If laws differ by jurisdiction, assume INDIA unless explicitly stated otherwise.

===== CRITICAL: RESPONSE FORMAT (MANDATORY) =====

Return ONLY valid JSON. Return nothing else.
- Do NOT include any text before the JSON.
- Do NOT include any text after the JSON.
- Do NOT wrap JSON in markdown code blocks.
- Do NOT include backticks anywhere.
- Return raw JSON object only.

Return exactly this structure:
{
  "summary": "Short, clear explanation (2-4 sentences)",
  "steps": ["Step 1: Do this", "Step 2: Then do this", "Step 3: Finally do this"],
  "legal_references": ["Act/Section 1", "Act/Section 2"],
  "flowchart": "flowchart TD\\n  A[Problem] --> B[Action]\\n  B --> C[Result]",
  "disclaimer": "This is general legal information, not legal advice. Consult a licensed advocate for case-specific guidance."
}

===== VALIDATION RULES =====
- summary: Non-empty string (2-4 sentences)
- steps: Array with at least 2 elements
- legal_references: Array of act names/sections
- flowchart: String starting with "flowchart TD" (Mermaid syntax)
- disclaimer: Non-empty string with legal caveat

Every response MUST include a Mermaid flowchart.
Every response MUST be valid JSON.`;


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

    // Validate summary
    if (!response.summary || typeof response.summary !== 'string' || response.summary.trim().length === 0) {
      errors.push('summary must be a non-empty string');
    }

    // Validate steps
    if (!Array.isArray(response.steps) || response.steps.length < 2) {
      errors.push('steps must be an array with at least 2 elements');
    }

    // Validate legal_references
    if (!Array.isArray(response.legal_references)) {
      errors.push('legal_references must be an array');
    }

    // Validate flowchart (CRITICAL)
    if (!response.flowchart || typeof response.flowchart !== 'string') {
      errors.push('flowchart must be a non-empty string');
    } else if (!response.flowchart.includes('flowchart TD') && !response.flowchart.includes('graph TD')) {
      errors.push('flowchart must contain "flowchart TD" or "graph TD"');
    }

    // Validate disclaimer
    if (!response.disclaimer || typeof response.disclaimer !== 'string' || response.disclaimer.trim().length === 0) {
      errors.push('disclaimer must be a non-empty string');
    }

    if (errors.length > 0) {
      console.error('❌ Response validation failed:', errors);
      throw new Error(`Response validation failed: ${errors.join('; ')}`);
    }

    console.log('✅ Response validation passed');
  }
}

export const anthropicService = new AnthropicService();
