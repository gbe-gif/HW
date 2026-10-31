const PASSWORD_DIGEST = '79f49485198ebaafc553906d7a1fbc70a8fe78429c2c393979e4a0a97346a836';
export async function checkGalleryPassword(value) {
  const digest = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
  const hex = Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join('');
  return hex === PASSWORD_DIGEST;
}
