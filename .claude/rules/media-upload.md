---
paths:
  - "app/api/r2/**/*.ts"
  - "app/admin/**/*.tsx"
  - "lib/r2.ts"
---

# Media Upload (Cloudflare R2)

- Upload flow: admin form → `/api/r2/presign` generates signed URL → browser PUTs directly to R2.
- Three media slots per session: audio (required), thumbnail (optional), video (optional).
- `lib/r2.ts` wraps the S3-compatible client for R2.
- Public URLs use the R2 public domain: `pub-09df2e878efe41019b9524fea54e7197.r2.dev`.
- CORS is configured on the Cloudflare dashboard, not in code. If uploads fail with CORS errors, check there.
- `serverActions.bodySizeLimit` in next.config.mjs is set to 100MB for large video uploads via server actions (fallback path).
- Audio duration is extracted client-side via Web Audio API and saved to `sessions.duration` (numeric, minutes with one decimal).
