import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface TextChunk {
  content: string;
  metadata: {
    chunkIndex: number;
    startIndex: number;
    endIndex: number;
  };
}

export async function splitTextIntoChunks(
  text: string,
  chunkSize = 1000,
  chunkOverlap = 200
): Promise<TextChunk[]> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', ' ', ''], // Split by paragraphs, then lines, then words
  });

  const documents = await splitter.createDocuments([text]);
  
  return documents.map((doc, i) => ({
    content: doc.pageContent,
    metadata: {
      chunkIndex: i,
      startIndex: doc.metadata.loc?.lines?.from ?? 0,
      endIndex: doc.metadata.loc?.lines?.to ?? 0,
    },
  }));
}

export function extractTextFromHtml(html: string): string {
  // Remove script and style elements
  const cleanHtml = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ') // Remove remaining HTML tags
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();

  // Decode HTML entities
  const text = cleanHtml
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return text;
}

export function estimateTokenCount(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  return Math.ceil(text.length / 4);
}
