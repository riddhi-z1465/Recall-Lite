import { createClient } from '@/lib/supabase-server';
import { getEmbeddings } from '@/lib/embeddings';
import { openai } from '@ai-sdk/openai';
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
        const lastMessage = messages[messages.length - 1];
        const embedding = await getEmbeddings(lastMessage.content);

        // 3. Search for Context
        const { data: chunks, error } = await supabase.rpc('match_page_sections', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 5,
            filter_document_id: documentId,
        });

        if (error) {
            console.error('Error searching documents:', error);
            return new Response('Error searching documents', { status: 500 });
        }

        const relevantChunks = chunks
            .map((chunk: any) => chunk.text)
            .join('\n\n');

        // 4. Generate Response
        const systemPrompt = `You are a helpful assistant. Use the following context to answer the user's question.
    If the answer is not in the context, say you don't know.
    Context:
    ${relevantChunks}
    
    Cite sources by referring to the context.`;

        const result = await streamText({
            model: openai('gpt-4o-mini'),
            messages: convertToCoreMessages(messages),
            system: systemPrompt,
        });

        return result.toTextStreamResponse();
    } catch (error: any) {
        console.error('Error in chat:', error);
        return new Response(error.message, { status: 500 });
    }
}
