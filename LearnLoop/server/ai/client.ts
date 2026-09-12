import OpenAI from 'openai';
import { db } from '../db/database.js';

export function getAiClient(): { client: OpenAI | null; model: string; provider: string; isConfigured: boolean } {
  const config = db.getAiConfig();

  // Environment variables take highest priority, then database settings
  const provider = (process.env.AI_PROVIDER as any) || config.provider || 'openai';
  const apiKey = process.env.AI_API_KEY || config.api_key || '';
  const model = process.env.AI_MODEL || config.model || (provider === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini');

  let baseURL = process.env.AI_BASE_URL || config.base_url || '';

  if (!baseURL) {
    if (provider === 'gemini') {
      baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
    } else if (provider === 'openrouter') {
      baseURL = 'https://openrouter.ai/api/v1';
    } else if (provider === 'openai') {
      baseURL = 'https://api.openai.com/v1';
    }
  }

  // If no API key is provided, we can still operate in Demo / Mock evaluation mode
  if (!apiKey) {
    return {
      client: null,
      model,
      provider,
      isConfigured: false,
    };
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    });

    return {
      client,
      model,
      provider,
      isConfigured: true,
    };
  } catch (err) {
    console.error('Failed to initialize OpenAI client:', err);
    return {
      client: null,
      model,
      provider,
      isConfigured: false,
    };
  }
}
