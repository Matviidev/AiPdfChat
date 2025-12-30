import { Pinecone } from '@pinecone-database/pinecone';
import 'dotenv/config';

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME!;

function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200,
): string[] {
  if (!text) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    if (end === text.length) break;
    start += chunkSize - overlap;
  }

  return chunks;
}

function generateId(key: string, index: number): string {
  const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${safeKey}-chunk-${index}`;
}

export const handler = async (event: any) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  let docId: string | undefined;

  try {
    const { docId, text } = event;

    if (!text || !docId) {
      console.warn('Missing text or key. Returning failed status.');
      return {
        status: 'failed',
        docId: docId || 'UNKNOWN_KEY',
        reason: 'Missing text or key in payload',
      };
    }

    const textChunks = chunkText(text, 1000, 200);
    console.log(`Split text into ${textChunks.length} chunks.`);

    if (textChunks.length === 0) {
      return {
        status: 'failed',
        reason: 'Text was empty',
        docId,
      };
    }

    const records = textChunks.map((chunk, i) => ({
      id: generateId(docId, i),
      chunk_text: chunk,
      source_key: docId,
      chunk_index: i,
    }));

    const index = pc.index(INDEX_NAME);
    const BATCH_SIZE = 100;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await index.upsertRecords(batch);
      console.log(
        `Upserted batch ${i / BATCH_SIZE + 1} (${batch.length} records)`,
      );
    }

    return {
      status: 'success',
      docId: docId,
      chunksProcessed: records.length,
      message: 'Indexing complete',
    };
  } catch (err: any) {
    console.error('Error indexing to Pinecone:', err);

    return {
      status: 'failed',
      docId: docId || 'UNKNOWN_KEY',
      reason: err.message || 'Unknown Pinecone error',
      errorStack: err.stack,
    };
  }
};
