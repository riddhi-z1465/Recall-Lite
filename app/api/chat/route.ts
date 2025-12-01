import { createClient } from '@/lib/supabase-server';
import { getEmbeddings } from '@/lib/embeddings';
import { groq } from '@ai-sdk/groq';
import { streamText, convertToCoreMessages } from 'ai';

export async function POST(req: Request) {
    try {
        const { messages, documentId } = await req.json();
        const supabase = await createClient();

        // 1. Validate User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return new Response('Unauthorized', { status: 401 });
        }

        // 2. Get Last Message & Embed
        // 2. Get Last Message & Embed
        if (!Array.isArray(messages)) {
            return new Response('Messages must be an array', { status: 400 });
        }

        if (!process.env.GROQ_API_KEY) {
            console.error('Missing GROQ_API_KEY');
            return new Response('Server Configuration Error: Missing API Key', { status: 500 });
        }

        const lastMessage = messages[messages.length - 1];
        console.log('v2: Processing chat for document:', documentId);

        // Validate documentId is a valid UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!documentId || !uuidRegex.test(documentId)) {
            console.error('Invalid document ID format:', documentId);
            return new Response(
                JSON.stringify({
                    error: 'Invalid document ID. Please delete this document and re-add it.'
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }

        const embedding = await getEmbeddings(lastMessage.content);

        // 3. Search for Context
        const { data: chunks, error } = await supabase.rpc('match_page_sections', {
            query_embedding: embedding,
            match_threshold: 0.1, // Lower threshold to ensure we get results with local embeddings
            match_count: 5,
            filter_document_id: documentId,
        });

        if (error) {
            console.error('Error searching documents:', error);
        }

        const relevantChunks = (chunks || [])
            .map((chunk: any) => chunk.text)
            .join('\n\n');

        if (!relevantChunks) {
            console.log('No relevant chunks found. User might need to re-add document.');
        }

        // 4. Generate Response
        const systemPrompt = `You are a strict assistant that answers questions ONLY based on the provided context.

Rules:
1. You must reply strictly from the provided context chunks.
2. Do NOT use any external knowledge or information not present in the context.
3. Do NOT hallucinate or invent information.
4. If the answer is not explicitly in the context, state that you cannot answer based on the available information.
5. Do not make assumptions.

Context:
${relevantChunks || 'No context available. (Note: If you recently updated the app, please delete and re-add your document to regenerate embeddings.)'}

Cite sources by referring to the context.`;

        try {
            const result = await streamText({
                model: groq('llama-3.3-70b-versatile'),
                messages: messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
                system: systemPrompt,
            });

            return result.toTextStreamResponse();
        } catch (error: any) {
            console.error('AI API Error:', error);
            // Fallback: Return a stream with a friendly error message
            const errorMessage = "I'm sorry, I cannot answer right now. Please check your API keys and quota. (This is a system message)";

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
