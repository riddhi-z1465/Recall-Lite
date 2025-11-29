import { pipeline } from '@xenova/transformers';

// Singleton to prevent reloading the model on every request
class EmbeddingPipeline {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance: any = null;

    static async getInstance() {
        if (this.instance === null) {
            this.instance = await pipeline(this.task as any, this.model);
        }
        return this.instance;
    }
}

export async function getEmbeddings(text: string) {
    try {
        const extractor = await EmbeddingPipeline.getInstance();
        const output = await extractor(text.replace(/\n/g, ' '), { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data) as number[];

        // Pad to 1536 dimensions to match OpenAI's format and existing DB schema
        // This allows us to use the existing vector column without migration, 
        // though old OpenAI embeddings will not be compatible with new ones.
        if (embedding.length < 1536) {
            const padding = new Array(1536 - embedding.length).fill(0);
            return [...embedding, ...padding];
        }

        return embedding.slice(0, 1536);
    } catch (error) {
        console.error('Error generating embeddings:', error);
        // Fallback to zero vector
        return new Array(1536).fill(0);
    }
}
