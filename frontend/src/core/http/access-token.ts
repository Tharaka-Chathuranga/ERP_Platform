const TOKEN_KEY = "erp.token";

interface AccessTokenClaims {
  exp?: number;
}

function decodeClaims(token: string): AccessTokenClaims | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as AccessTokenClaims;
  } catch {
    return null;
  }
}

export function accessTokenExpiresAt(token: string): number | null {
  const claims = decodeClaims(token);
  return typeof claims?.exp === "number" ? claims.exp * 1000 : null;
}

export function isAccessTokenExpired(token: string): boolean {
  const expiresAt = accessTokenExpiresAt(token);
  return expiresAt === null || expiresAt <= Date.now();
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAccessToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (isAccessTokenExpired(token)) {
    setAccessToken(null);
    return null;
  }
  return token;
}

export function getAccessTokenExpiry(): number | null {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? accessTokenExpiresAt(token) : null;
}
