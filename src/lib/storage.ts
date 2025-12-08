import * as Minio from "minio";

// MinIO configuration
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000", 10);
// Support both typical MinIO env names and username/password aliases
const MINIO_ACCESS_KEY =
  process.env.MINIO_ACCESS_KEY ||
  process.env.MINIO_USERNAME || // alias for username
  "";
const MINIO_SECRET_KEY =
  process.env.MINIO_SECRET_KEY ||
  process.env.MINIO_PASSWORD || // alias for password
  "";
const MINIO_BUCKET = process.env.MINIO_BUCKET || "knowledge-docs";
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";

let client: Minio.Client | null = null;

/**
 * Get or create the MinIO client singleton
 */
export function getStorageClient(): Minio.Client {
  if (!client) {
    const { endPoint, port, useSSL } = resolveMinioEndpoint();

    client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY,
    });
  }
  return client;
}

function resolveMinioEndpoint(): {
  endPoint: string;
  port: number;
  useSSL: boolean;
} {
  // If MINIO_ENDPOINT includes scheme, parse it; otherwise use raw values.
  if (
    MINIO_ENDPOINT.startsWith("http://") ||
    MINIO_ENDPOINT.startsWith("https://")
  ) {
    try {
      const url = new URL(MINIO_ENDPOINT);
      const endPoint = url.hostname;
      const useSSL = url.protocol === "https:";
      // Use port from URL if specified, otherwise fall back to MINIO_PORT env var
      const port =
        url.port && Number(url.port) > 0
          ? Number(url.port)
          : MINIO_PORT > 0
            ? MINIO_PORT
            : useSSL
              ? 443
              : 80;
      return { endPoint, port, useSSL };
    } catch {
      // Fall through to defaults
    }
  }

  return {
    endPoint: MINIO_ENDPOINT,
    port: MINIO_PORT,
    useSSL: MINIO_USE_SSL,
  };
}

/**
 * Get the bucket name
 */
export function getBucketName(): string {
  return MINIO_BUCKET;
}

/**
 * Ensure the bucket exists
 */
export async function ensureBucket(): Promise<void> {
  const minio = getStorageClient();

  const exists = await minio.bucketExists(MINIO_BUCKET);
  if (!exists) {
    await minio.makeBucket(MINIO_BUCKET);
    console.log(`Created MinIO bucket: ${MINIO_BUCKET}`);
    
    // Set bucket policy to allow public read access
    // This is needed for presigned URLs to work in browsers
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
        },
      ],
    };
    
    try {
      await minio.setBucketPolicy(MINIO_BUCKET, JSON.stringify(policy));
      console.log(`Set public read policy for bucket: ${MINIO_BUCKET}`);
    } catch (error) {
      console.warn(`Failed to set bucket policy (may already exist):`, error);
    }
  }
}

/**
 * Upload a file to storage
 */
export async function uploadFile(
  objectName: string,
  buffer: Buffer,
  contentType: string = "application/octet-stream"
): Promise<string> {
  const minio = getStorageClient();

  await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
    "Content-Type": contentType,
  });

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
  const minio = getStorageClient();

  try {
    const url = await minio.presignedGetObject(
      MINIO_BUCKET,
      objectName,
      expirySeconds
    );

    return url;
  } catch (error) {
    console.error(`[getSignedUrl] Failed to generate presigned URL for ${objectName}:`, error);
    throw error;
  }
}

/**
 * Delete a file from storage
 */
export async function deleteFile(objectName: string): Promise<void> {
  const minio = getStorageClient();
  await minio.removeObject(MINIO_BUCKET, objectName);
}

/**
 * Delete all files for a document
 */
export async function deleteDocumentFiles(docId: string): Promise<void> {
  const minio = getStorageClient();
  const prefix = `documents/${docId}/`;

  const objectsList: string[] = [];
  const stream = minio.listObjects(MINIO_BUCKET, prefix, true);

  for await (const obj of stream) {
    if (obj.name) {
      objectsList.push(obj.name);
    }
  }

  if (objectsList.length > 0) {
    await minio.removeObjects(MINIO_BUCKET, objectsList);
  }
}

/**
 * Check if a file exists
 */
export async function fileExists(objectName: string): Promise<boolean> {
  const minio = getStorageClient();

  try {
    await minio.statObject(MINIO_BUCKET, objectName);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file as buffer
 */
export async function getFile(objectName: string): Promise<Buffer> {
  const minio = getStorageClient();

  const stream = await minio.getObject(MINIO_BUCKET, objectName);
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
