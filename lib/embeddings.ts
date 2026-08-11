import { GoogleGenerativeAI } from '@google/generative-ai';

export async function getEmbeddings(text: string) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ GEMINI_API_KEY is missing. Returning zero vector.");
            return new Array(1536).fill(0);
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
        
        const result = await model.embedContent(text);
        const embedding = result.embedding.values;

        // Pad to 1536 dimensions to match existing DB schema
        if (embedding.length < 1536) {
            const padding = new Array(1536 - embedding.length).fill(0);
            return [...embedding, ...padding];
        }

        return embedding.slice(0, 1536);
    } catch (error) {
        console.error('Error generating embeddings with Gemini:', error);
        // Fallback to zero vector
        return new Array(1536).fill(0);
    }
}
