import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(client);

const DOCUMENT_TABLE = process.env.AWS_DOCUMENT_TABLE!;

export const handler = async (event: any) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  try {
    const inputBody = event.body || event;
    const docId = inputBody.docId;

    if (!docId) {
      throw new Error('Missing docId in input event');
    }

    await ddb.send(
      new UpdateCommand({
        TableName: DOCUMENT_TABLE,
        Key: {
          id: docId,
        },
        UpdateExpression: 'set #status = :s',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':s': 'success',
          ':t': Date.now(),
        },
      }),
    );

    console.log(`Successfully updated document ${docId} status to success.`);

    return {
      statusCode: 200,
      body: {
        message: 'Status updated successfully',
        docId: docId,
        status: 'success',
      },
    };
  } catch (err) {
    console.error('Error updating DynamoDB status:', err);
    throw err;
  }
};
