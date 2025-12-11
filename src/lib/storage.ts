import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

// S3 configuration - supports both AWS S3 and MinIO env var names
const S3_REGION = process.env.MINIO_REGION || process.env.AWS_REGION || "us-east-1";
const S3_ACCESS_KEY =
  process.env.MINIO_ACCESS_KEY ||
  process.env.AWS_ACCESS_KEY_ID ||
  "";
const S3_SECRET_KEY =
  process.env.MINIO_SECRET_KEY ||
  process.env.AWS_SECRET_ACCESS_KEY ||
  "";
const S3_BUCKET = process.env.MINIO_BUCKET || process.env.S3_BUCKET || "knowledge-docs";
const S3_PREFIX = process.env.MINIO_PREFIX || process.env.S3_PREFIX || "";

let client: S3Client | null = null;

/**
 * Get or create the S3 client singleton
 */
export function getStorageClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
    });
  }
  return client;
}

/**
 * Get the bucket name
 */
export function getBucketName(): string {
  return S3_BUCKET;
}

/**
 * Get the full object path with prefix
 */
function withPrefix(objectName: string): string {
  if (!S3_PREFIX) return objectName;
  return `${S3_PREFIX}/${objectName}`;
}

/**
 * Ensure the bucket exists and is accessible
 * Note: For IAM users with limited permissions (no s3:ListBucket),
 * we skip the bucket check and assume it exists.
 */
export async function ensureBucket(): Promise<void> {
  console.log(`[ensureBucket] Using bucket: ${S3_BUCKET}, region: ${S3_REGION}, prefix: ${S3_PREFIX}`);
  console.log(`[ensureBucket] Bucket check skipped (assuming bucket exists with proper IAM permissions)`);
  // Skip HeadBucket check - IAM user may only have object-level permissions
  // The upload will fail with a clear error if the bucket doesn't exist
}

/**
 * Upload a file to storage
 */
export async function uploadFile(
  objectName: string,
  buffer: Buffer,
  contentType: string = "application/octet-stream"
): Promise<string> {
  const s3 = getStorageClient();
  const fullPath = withPrefix(objectName);

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fullPath,
      Body: buffer,
      ContentType: contentType,
    })
  );

  return objectName;
}

/**
 * Upload original PDF document
 * Path: documents/{doc_id}/original.pdf
 */
export async function uploadDocument(
  docId: string,
  buffer: Buffer,
  originalFilename: string
): Promise<string> {
  const ext = originalFilename.split(".").pop() || "pdf";
  const objectName = `documents/${docId}/original.${ext}`;

  await uploadFile(objectName, buffer, getMimeType(ext));
  return objectName;
}

/**
 * Upload page image
 * Path: documents/{doc_id}/pages/page-{n}.png
 */
export async function uploadPageImage(
  docId: string,
  pageNumber: number,
  buffer: Buffer
): Promise<string> {
  const objectName = `documents/${docId}/pages/page-${pageNumber}.png`;

  await uploadFile(objectName, buffer, "image/png");
  return objectName;
}

/**
 * Get a presigned URL for accessing a file
 * Default expiry: 1 hour (3600 seconds)
 */
export async function getSignedUrl(
  objectName: string,
  expirySeconds: number = 3600
): Promise<string> {
  const s3 = getStorageClient();
  const fullPath = withPrefix(objectName);

  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: fullPath,
    });

    const url = await awsGetSignedUrl(s3, command, { expiresIn: expirySeconds });
    return url;
  } catch (error) {
    console.error(
      `[getSignedUrl] Failed to generate presigned URL for ${fullPath}:`,
      error
    );
    throw error;
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(objectName: string): Promise<void> {
  const s3 = getStorageClient();

  await s3.send(
    new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: withPrefix(objectName),
    })
  );
}

/**
 * Delete all files for a document
 */
export async function deleteDocumentFiles(docId: string): Promise<void> {
  const s3 = getStorageClient();
  const prefix = withPrefix(`documents/${docId}/`);

  // List all objects with the prefix
  const listResponse = await s3.send(
    new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    })
  );

  const objects = listResponse.Contents;
  if (!objects || objects.length === 0) {
    return;
  }

  // Delete all objects
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: S3_BUCKET,
      Delete: {
        Objects: objects.map((obj) => ({ Key: obj.Key })),
      },
    })
  );
}

/**
 * Check if a file exists
 */
export async function fileExists(objectName: string): Promise<boolean> {
  const s3 = getStorageClient();

  try {
    await s3.send(
      new HeadObjectCommand({
        Bucket: S3_BUCKET,
        Key: withPrefix(objectName),
      })
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file as buffer
 */
export async function getFile(objectName: string): Promise<Buffer> {
  const s3 = getStorageClient();

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: withPrefix(objectName),
    })
  );

  // Convert stream to buffer
  const stream = response.Body as Readable;
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

/**
 * Get MIME type from file extension
 */
function getMimeType(ext: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    txt: "text/plain",
    json: "application/json",
  };

  return mimeTypes[ext.toLowerCase()] || "application/octet-stream";
}
