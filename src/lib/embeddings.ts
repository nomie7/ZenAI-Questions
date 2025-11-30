import { OpenAIEmbeddings } from "@langchain/openai";

// Use OpenAI's text-embedding-3-small model (1536 dimensions)
const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embedding for a single text
 */
export async function embedText(text: string): Promise<number[]> {
  const result = await embeddings.embedQuery(text);
  return result;
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  const results = await embeddings.embedDocuments(texts);
  return results;
}

/**
 * Get the embedding dimension (for Qdrant collection setup)
 */
export function getEmbeddingDimension(): number {
  return 1536;
}
