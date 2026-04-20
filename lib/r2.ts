import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
const PUBLIC_R2_URL = "https://pub-09df2e878efe41019b9524fea54e7197.r2.dev";

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME ?? "dailymeds";

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    ContentType: contentType,
  });

  // Generate presigned URL then rebuild it with public domain
  // (can't use public domain directly since SDK needs private endpoint for auth)
  const presignedUrl = await getSignedUrl(r2, command, { expiresIn });

  // Extract the query params and path
  const url = new URL(presignedUrl);
  return new URL(url.pathname + url.search, PUBLIC_R2_URL).toString();
}

export async function deleteR2Object(key: string): Promise<void> {
  await r2.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function r2PublicUrl(key: string): string {
  return `https://pub-09df2e878efe41019b9524fea54e7197.r2.dev/${key}`;
}
