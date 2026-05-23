import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Logs a Supabase query error with context. Use this helper when destructuring
 * query results in server pages to avoid silently swallowing errors.
 *
 * @param context - Description of what was being fetched (e.g., "wedding events")
 * @param error - The PostgrestError from Supabase, or null
 */
export function logQueryError(context: string, error: PostgrestError | null): void {
  if (error) {
    console.error(`[query] Failed to fetch ${context}:`, error.message, error.details);
  }
}
