import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getEmbeddings(text: string) {
    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text.replace(/\n/g, ' '),
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error('Error calling OpenAI embeddings API:', error);
        // Fallback to mock embedding if API fails (e.g. quota exceeded)
        // text-embedding-3-small has 1536 dimensions
        return new Array(1536).fill(0);
    }
}
