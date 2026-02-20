/** Per-token pricing in USD. Rates are per-token (not per-million). */
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Anthropic
  'claude-sonnet-4-5-20250929': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  'claude-sonnet-4-5': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  'claude-haiku-3-5': { input: 0.8 / 1_000_000, output: 4.0 / 1_000_000 },
  'claude-3-5-haiku-20241022': { input: 0.8 / 1_000_000, output: 4.0 / 1_000_000 },
  'claude-3-5-sonnet-20241022': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  // OpenAI
  'gpt-4o': { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 },
  'gpt-4o-2024-11-20': { input: 2.5 / 1_000_000, output: 10.0 / 1_000_000 },
  'gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
  'gpt-4o-mini-2024-07-18': { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
  // DeepSeek
  'deepseek-chat': { input: 0.27 / 1_000_000, output: 1.10 / 1_000_000 },
  'deepseek-reasoner': { input: 0.55 / 1_000_000, output: 2.19 / 1_000_000 },
  // Kimi (Moonshot)
  'moonshot-v1-128k': { input: 0.84 / 1_000_000, output: 0.84 / 1_000_000 },
  'moonshot-v1-32k': { input: 0.34 / 1_000_000, output: 0.34 / 1_000_000 },
  // OpenRouter (popular models — pricing varies, these are approximate)
  'google/gemini-2.0-flash': { input: 0.10 / 1_000_000, output: 0.40 / 1_000_000 },
  'anthropic/claude-3.5-sonnet': { input: 3.0 / 1_000_000, output: 15.0 / 1_000_000 },
  'meta-llama/llama-3.1-405b': { input: 2.0 / 1_000_000, output: 2.0 / 1_000_000 },
}

/** Default rate for unknown models (assumes mid-range pricing). */
const DEFAULT_PRICING = { input: 2.0 / 1_000_000, output: 8.0 / 1_000_000 }

export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] ?? DEFAULT_PRICING
  return inputTokens * pricing.input + outputTokens * pricing.output
}
