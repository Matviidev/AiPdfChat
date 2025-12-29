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
    const payload = event.body || event;
    const { key, text } = payload;

    if (key) docId = key;

    // 2. Validation Checks
    if (!text || !key) {
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
        status: 'skipped',
        reason: 'Text was empty',
        docId: key,
      };
    }

    // 4. Prepare Records
    const records = textChunks.map((chunk, i) => ({
      id: generateId(key, i),
      values: [],
      metadata: {
        chunk_text: chunk,
        source_key: key,
        chunk_index: i,
      },
    }));

    const index = pc.index(INDEX_NAME);
    const BATCH_SIZE = 100;

    for (let i = 0; i < records.length; i += BATCH_SIZE) {
      const batch = records.slice(i, i + BATCH_SIZE);
      await index.upsert(batch as any);
      console.log(
        `Upserted batch ${i / BATCH_SIZE + 1} (${batch.length} records)`,
      );
    }

    return {
      status: 'success',
      docId: key,
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
