/**
 * AI Scheduler Service — BYOK (Bring Your Own Key)
 *
 * Reads the Gemini API key from localStorage at runtime.
 * Provides helper utilities for checking key status and making AI requests.
 */

const STORAGE_KEY = "lyra_gemini_api_key";

/** Retrieve the stored Gemini API key */
export function getApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

/** Store the Gemini API key */
export function setApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key);
}

/** Remove the stored Gemini API key */
export function removeApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/** Check if a valid key is configured */
export function isKeyConfigured(): boolean {
  const key = getApiKey();
  return !!key && key.trim().length > 0;
}

export interface AiSchedulerResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Generate a smart schedule suggestion using the Gemini API.
 * Throws a user-friendly error if no API key is configured.
 */
export async function generateScheduleSuggestion(
  prompt: string
): Promise<AiSchedulerResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: "No API key configured. Go to Settings → AI Integration to add your Gemini key.",
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Lyra, an AI productivity assistant. Help the user optimize their schedule.\n\n${prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message =
        (errorBody as Record<string, Record<string, string>>)?.error?.message ||
        `API request failed (${response.status})`;

      if (response.status === 400 || response.status === 403) {
        return { success: false, error: `Invalid API key. Please check your key in Settings. (${message})` };
      }
      return { success: false, error: message };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error. Check your connection.",
    };
  }
}
