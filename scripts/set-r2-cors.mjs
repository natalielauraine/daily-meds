/**
 * One-time script: Configures CORS on the Daily Meds R2 bucket
 * so that presigned PUT uploads from the browser don't get blocked.
 *
 * Run with:  node scripts/set-r2-cors.mjs
 */

import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env manually (no dotenv dependency needed)
const envPath = resolve(process.cwd(), ".env");
readFileSync(envPath, "utf-8").split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w]+)\s*=\s*(.+?)\s*$/);
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
});

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const bucket    = process.env.CLOUDFLARE_R2_BUCKET_NAME || "dailymeds";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const corsRules = [
  {
    AllowedOrigins: [
      "http://localhost:3000",
      "https://thedailymeds.com",
      "https://www.thedailymeds.com",
    ],
    AllowedMethods: ["PUT", "GET", "HEAD"],
    AllowedHeaders: ["*"],
    ExposeHeaders: ["ETag", "x-amz-checksum-crc32"],
    MaxAgeSeconds: 3600,
  },
];

async function main() {
  console.log(`Setting CORS on R2 bucket "${bucket}"...`);
  await r2.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: { CORSRules: corsRules },
    })
  );
  console.log("✅ CORS rules applied successfully!");
  console.log("Allowed origins:", corsRules[0].AllowedOrigins.join(", "));
}

main().catch((err) => {
  console.error("❌ Failed to set CORS:", err.message);
  process.exit(1);
});
