
export async function hashVaultEntry(content: string, metadata: any): Promise<string> {
  const data = JSON.stringify({ content, metadata });
  
  // Try standard Web Crypto API first
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      console.warn("WebCrypto failed, falling back to simple hash", e);
    }
  }

  // Simple fallback hash for non-secure contexts or incompatible browsers
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'fallback-' + Math.abs(hash).toString(16) + '-' + data.length;
}
