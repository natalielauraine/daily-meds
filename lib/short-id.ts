const CHARS = "0123456789abcdefghijklmnopqrstuvwxyz";

export function generateShortId(length = 6): string {
  let id = "";
  const arr = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i++) {
    id += CHARS[arr[i] % CHARS.length];
  }
  return id;
}
