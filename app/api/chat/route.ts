import { getServerUser } from '@/lib/firebase-server';
import { queryFirestoreDocs } from '@/lib/firestore-rest';
import { getEmbeddings } from '@/lib/embeddings';
import { GoogleGenerativeAI } from '@google/generative-ai';

function cosineSimilarity(a: number[], b: number[]) {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(req: Request) {
    try {
        const { messages, documentId } = await req.json();
        const user = await getServerUser();

        // 1. Validate User
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // 2. Get Last Message & Embed
        if (!Array.isArray(messages)) {
            return new Response('Messages must be an array', { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        if (!apiKey) {
            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue("⚠️ GEMINI_API_KEY is missing in .env.local. Please get a Gemini API key from https://aistudio.google.com and set GEMINI_API_KEY=your_key in .env.local to enable Gemini AI responses.");
                    controller.close();
                },
            });
            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        if (!documentId) {
            return new Response(
                JSON.stringify({ error: 'Missing document ID.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const lastMessage = messages[messages.length - 1];
        console.log('Processing chat for document:', documentId);

        const embedding = await getEmbeddings(lastMessage.content);

        // 3. Search for Context in Firestore via REST
        const chunks = await queryFirestoreDocs('chunks', 'document_id', documentId, user.token);

        const scoredChunks = chunks.map((data) => {
            const score = cosineSimilarity(embedding, data.embedding || []);
            return { text: data.text, score };
        });

        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.slice(0, 5);
        const relevantChunks = topChunks.map((c) => c.text).join('\n\n');

        // 4. Generate Response using Official GoogleGenerativeAI SDK
        const systemPrompt = `You are a strict assistant that answers questions ONLY based on the provided context.

Rules:
1. You must reply strictly from the provided context chunks.
2. Do NOT use any external knowledge or information not present in the context.
3. Do NOT hallucinate or invent information.
4. If the answer is not explicitly in the context, state that you cannot answer based on the available information.
5. Do not make assumptions.

Context:
${relevantChunks || 'No context available.'}

Cite sources by referring to the context.`;

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: systemPrompt,
            });

            // Convert message history to Google Gemini Format
            const history = messages.slice(0, -1).map((m: any) => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
            }));

            const chat = model.startChat({ history });
            const result = await chat.sendMessageStream(lastMessage.content);

            const encoder = new TextEncoder();
            const stream = new ReadableStream({
                async start(controller) {
                    try {
                        for await (const chunk of result.stream) {
                            const chunkText = chunk.text();
                            controller.enqueue(encoder.encode(chunkText));
                        }
                    } catch (err: any) {
                        console.error('Error during streaming:', err);
                        controller.enqueue(encoder.encode(`\n\n⚠️ Error during streaming: ${err.message}`));
                    } finally {
                        controller.close();
                    }
                },
            });

            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        } catch (error: any) {
            console.error('Gemini AI API Error:', error);
            const errorMessage = `⚠️ Gemini AI Error: ${error.message || "Could not generate response. Please check your GEMINI_API_KEY."}`;

            const stream = new ReadableStream({
                start(controller) {
                    controller.enqueue(errorMessage);
                    controller.close();
                },
            });

            return new Response(stream, {
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }
    } catch (error: any) {
        console.error('Error in chat:', error);
        return new Response(error.message, { status: 500 });
    }
}



