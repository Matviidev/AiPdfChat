import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const s3 = new S3Client({ region: process.env.AWS_REGION });

function parseS3Event(event: any): { bucket: string; key: string } {
  const bucket = event.detail?.bucket?.name;
  const key = event.detail?.object?.key;

  if (!bucket || !key) {
    throw new Error('Invalid S3 EventBridge event structure');
  }

  return {
    bucket,
    key: decodeURIComponent(key.replace(/\+/g, ' ')),
  };
}

async function getS3ObjectBuffer(bucket: string, key: string): Promise<Buffer> {
  const response = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  if (!response.Body) throw new Error('S3 response Body is empty');

  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  if (buffer.length === 0) throw new Error('Buffer is empty');
  return buffer;
}

async function extractPdfText(
  buffer: Buffer,
): Promise<{ text: string; numpages: number; info: any }> {
  const data = await pdf(buffer);
  return {
    text: data.text ?? '',
    numpages: data.numpages,
    info: data.info,
  };
}

export const handler = async (event: any) => {
  console.log('EventBridge S3 event:', JSON.stringify(event, null, 2));

  let docId: string = 'UNKNOWN';
  let bucketName: string = '';

  try {
    const { bucket, key } = parseS3Event(event);
    docId = key;
    bucketName = bucket;

    const buffer = await getS3ObjectBuffer(bucket, key);
    const pdfData = await extractPdfText(buffer);

    return {
      status: 'success',
      docId: docId,
      bucket: bucketName,
      text: pdfData.text,
      metadata: {
        numpages: pdfData.numpages,
        info: pdfData.info,
      },
    };
  } catch (err: any) {
    console.error('Error processing document:', err);

    return {
      status: 'failed',
      docId: docId,
      error: err.message || 'Unknown error',
      errorStack: err.stack,
    };
  }
};
