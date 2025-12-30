import * as Joi from 'joi';

export const validationSchema = Joi.object({
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  AWS_DYNAMODB_DOCUMENT_TABLE: Joi.string().required(),

  PINECONE_API_KEY: Joi.string().required(),
  PINECONE_INDEX_NAME: Joi.string().required(),
});
