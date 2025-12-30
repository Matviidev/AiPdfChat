export default () => ({
  aws: {
    region: process.env.AWS_REGION!,
    awsDynamodbDocumentTable: process.env.AWS_DYNAMODB_DOCUMENT_TABLE!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    documentBucket: process.env.AWS_DOCUMENT_BUCKET!,
  },
  pinecone: {
    pineconeApiKey: process.env.PINECONE_API_KEY!,
    pineconeIndexName: process.env.PINECONE_INDEX_NAME!,
  },
});
