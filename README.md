# Document Processing & AI Chat System

A document processing system built with NestJS that enables users to upload PDF documents to S3, processes them using AWS Lambda functions, indexes them in Pinecone, and provides an AI-powered chat interface to query document content.

## 🏗️ Architecture Overview

This project implements a document processing pipeline:

1. **Backend API** (NestJS) - Provides REST endpoints for document upload and AI chat
2. **S3** - Stores uploaded PDF documents
3. **DynamoDB** - Tracks document metadata and processing status
4. **Lambda Functions** - Process documents asynchronously:
   - Parse PDFs to text
   - Index text chunks in Pinecone
   - Update document status
5. **Pinecone** - Vector database for semantic search
6. **OpenAI** - Powers the AI chat interface with RAG (Retrieval Augmented Generation)

## 🚀 Features

- **Document Upload**: Generate pre-signed S3 URLs for secure document uploads
- **PDF Processing**: Automatic extraction of text from uploaded PDFs
- **Vector Indexing**: Documents are chunked and indexed in Pinecone for semantic search
- **AI Chat**: Query documents using natural language with context-aware responses
- **Status Tracking**: Real-time document processing status (pending, success, error)

## 🛠️ Technologies

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe development
- **AWS SDK v3** - AWS service integration (S3, DynamoDB)
- **Pinecone** - Vector database for embeddings
- **OpenAI** - AI chat completions
- **Docker** - Containerization

### AWS Services
- **S3** - Document storage
- **DynamoDB** - Document metadata
- **Lambda** - Serverless processing functions
- **EventBridge** - S3 event triggers (assumed)

### Infrastructure
- **Docker & Docker Compose** - Local development

## 📋 Prerequisites

- Node.js 20+ and npm
- Docker and Docker Compose
- AWS Account with appropriate permissions
- Pinecone account and API key
- OpenAI API key

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Matviidev/AiPdfChat
cd aws-practice-3
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_DYNAMODB_DOCUMENT_TABLE=documents
AWS_DOCUMENT_BUCKET=your-document-bucket

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_index_name

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini

# Server Configuration
PORT=3000
NODE_ENV=production
```

### 4. AWS Infrastructure Setup

Ensure the following AWS resources are configured:

#### DynamoDB Table
- **Table Name**: Match `AWS_DYNAMODB_DOCUMENT_TABLE`
- **Partition Key**: `id` (String)
- **Attributes**:
  - `id` (String)
  - `status` (String) - Values: `pending`, `success`, `error`
  - `filename` (String)
  - `userEmail` (String)

#### S3 Bucket
- **Bucket Name**: Match `AWS_DOCUMENT_BUCKET`
- **EventBridge Rule**: Configure to trigger `ParsePdfToText` Lambda on object creation
- **Permissions**: Allow Lambda functions to read objects

#### Lambda Functions
Deploy the following Lambda functions:

1. **ParsePdfToText** - Triggered by S3 EventBridge events
2. **IndexDocument** - Indexes text chunks in Pinecone
3. **UpdateStatusSuccess** - Updates document status to success
4. **UpdateStatusError** - Updates document status to error

#### Lambda Environment Variables
Each Lambda function requires:
- `AWS_REGION`
- `AWS_DOCUMENT_TABLE` (for status update functions)
- `PINECONE_API_KEY` and `PINECONE_INDEX_NAME` (for IndexDocument)

#### EventBridge Workflow
Configure EventBridge rules or Step Functions to:
1. Trigger `ParsePdfToText` on S3 upload
2. Trigger `IndexDocument` with parsed text
3. Trigger status update functions based on success/error

### 5. Pinecone Setup

1. Create a Pinecone index matching `PINECONE_INDEX_NAME`
2. Ensure the index supports the required metadata fields:
   - `source_key` (string)
   - `chunk_text` (string)
   - `chunk_index` (number)

### 6. Running with Docker Compose

```bash
# Build and start the backend
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f backend

# Stop the service
docker-compose down
```

### 7. Running Locally (Development)

```bash
cd backend

# Development mode with hot reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 📡 API Endpoints

### Base URL
```
http://localhost:3000
```

### Documents

#### Get Upload URL
Generate a pre-signed S3 URL for document upload.

**POST** `/documents/upload-url`

**Request Body:**
```json
{
  "filename": "example.pdf",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/...",
  "document": {
    "id": "uuid",
    "status": "pending",
    "filename": "example.pdf",
    "userEmail": "user@example.com"
  }
}
```

#### Get Document
Retrieve document metadata by ID.

**GET** `/documents/:id`

**Response:**
```json
{
  "id": "uuid",
  "status": "success",
  "filename": "example.pdf",
  "userEmail": "user@example.com"
}
```

### AI Chat

#### Ask Question
Query a document using natural language.

**POST** `/ai/documents/:id`

**Request Body:**
```json
{
  "message": "What is the main topic of this document?"
}
```

**Response:**
```json
{
  "answer": "Based on the provided document..."
}
```

## 🔄 Processing Workflow

1. **Client requests upload URL** → Backend creates document record in DynamoDB with status `pending`
2. **Client uploads PDF to S3** → S3 EventBridge event triggers `ParsePdfToText` Lambda
3. **PDF parsed to text** → Lambda extracts text and returns it
4. **Text indexed** → `IndexDocument` Lambda chunks text and upserts to Pinecone
5. **Status updated** → `UpdateStatusSuccess` or `UpdateStatusError` updates DynamoDB
6. **Client queries document** → Backend searches Pinecone, retrieves relevant chunks, and generates AI response

## 🔨 Lambda Functions

### ParsePdfToText
- **Trigger**: S3 EventBridge event (object created)
- **Purpose**: Extracts text from uploaded PDF files
- **Output**: Returns text content for indexing

### IndexDocument
- **Trigger**: Invoked with parsed text payload
- **Purpose**: Chunks text and indexes in Pinecone
- **Parameters**: `docId`, `text`
- **Chunking**: 1000 characters with 200 character overlap

### UpdateStatusSuccess / UpdateStatusError
- **Trigger**: Invoked after processing completes
- **Purpose**: Updates document status in DynamoDB
- **Parameters**: `docId`

## 🧪 Development

### Building Lambda Functions

Each Lambda function has a build script:

```bash
cd lambda/IndexDocument
npm install
npm run build:lambda
# Creates function.zip for deployment
```

### Linting

```bash
npm run lint              # Backend
npm run format            # Format code
```

## 🚢 Deployment

### Backend Deployment

#### Using Docker
```bash
docker build -t backend:latest ./backend
docker run -p 3000:3000 --env-file .env backend:latest
```

#### Using Docker Compose
```bash
docker-compose up -d --build
```

