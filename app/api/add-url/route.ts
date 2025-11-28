import { createClient } from '@/lib/supabase-server';
import { getEmbeddings } from '@/lib/embeddings';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export async function POST(req: Request) {
    try {
        const { url } = await req.json();
        const supabase = await createClient();

        // 1. Validate User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Fetch and Parse HTML
        const response = await fetch(url);
        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove scripts, styles, and other non-content elements
        $('script, style, nav, footer, iframe, noscript').remove();

        const title = $('title').text() || url;
        const content = $('body').text().replace(/\s+/g, ' ').trim();
        const excerpt = content.substring(0, 200) + '...';

        if (!content) {
            return NextResponse.json({ error: 'No content found' }, { status: 400 });
        }

        // 3. Store Document
        const { data: document, error: docError } = await supabase
            .from('documents')
            .insert({
                user_id: user.id,
                url,
                title,
                content,
                excerpt,
            })
            .select()
            .single();

        if (docError) throw docError;

        // 4. Chunk Text
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const chunks = await splitter.createDocuments([content]);

        // 5. Generate Embeddings and Store Chunks
        const chunkData = await Promise.all(
            chunks.map(async (chunk, index) => {
                const embedding = await getEmbeddings(chunk.pageContent);
                return {
                    document_id: document.id,
                    chunk_index: index,
                    text: chunk.pageContent,
                    embedding,
                };
            })
        );

        const { error: chunkError } = await supabase.from('chunks').insert(chunkData);
        if (chunkError) throw chunkError;

        return NextResponse.json({ success: true, documentId: document.id });
    } catch (error: any) {
        console.error('Error adding URL:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
