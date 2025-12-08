/**
 * Shared in-memory cache for citation images
 * 
 * This cache is populated during RAG searches and accessed by the citation UI
 * to display page images without including URLs in WebSocket payloads.
 * 
 * Uses global singleton pattern to ensure same instance across Next.js API routes
 */

// Use globalThis to ensure singleton across module reloads in dev mode
declare global {
  var citationImageCache: Map<string, string> | undefined;
}

export const citationImageCache = globalThis.citationImageCache ?? new Map<string, string>();

// Store in global to persist across hot reloads
if (process.env.NODE_ENV !== 'production') {
  globalThis.citationImageCache = citationImageCache;
}

/**
 * Store a citation image URL
 */
export function storeCitationImage(docName: string, pageNumber: number, imageUrl: string): void {
  const key = `${docName}|${pageNumber}`;
  citationImageCache.set(key, imageUrl);
}

/**
 * Get a citation image URL
 */
export function getCitationImage(docName: string, pageNumber: number): string | undefined {
  const key = `${docName}|${pageNumber}`;
  return citationImageCache.get(key);
}

/**
 * Clear all cached citation images
 */
export function clearCitationCache(): void {
  citationImageCache.clear();
}
