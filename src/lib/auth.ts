const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string
const REDIRECT_URI = `${window.location.origin.replace('localhost', '127.0.0.1')}/callback`

const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
].join(' ')

// PKCE helpers
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((x) => charset[x % charset.length])
    .join('')
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return crypto.subtle.digest('SHA-256', data)
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (const byte of bytes) str += String.fromCharCode(byte)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function initiateLogin(accountLabel?: string): Promise<void> {
  if (!CLIENT_ID) {
    throw new Error('VITE_SPOTIFY_CLIENT_ID is not set. Please create a .env file.')
  }

  const codeVerifier = generateRandomString(128)
  const codeChallenge = base64urlEncode(await sha256(codeVerifier))
  const state = accountLabel
    ? `${generateRandomString(16)}_${encodeURIComponent(accountLabel)}`
    : generateRandomString(16)

  // Store verifier keyed by state so multiple pending auths don't conflict
  sessionStorage.setItem(`pkce_verifier_${state}`, codeVerifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    state,
    scope: SCOPES,
    show_dialog: 'true', // always show so users can switch accounts
  })

  window.location.href = `https://accounts.spotify.com/authorize?${params}`
}

export interface TokenResponse {
  access_token: string
  refresh_token: string | null
  expires_in: number
  state: string
  codeVerifier: string
}

export async function exchangeCode(code: string, state: string): Promise<TokenResponse> {
  const codeVerifier = sessionStorage.getItem(`pkce_verifier_${state}`)
  if (!codeVerifier) throw new Error('No code verifier found for this state')

  sessionStorage.removeItem(`pkce_verifier_${state}`)

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  })

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Token exchange failed: ${err}`)
  }

  const data = await res.json()
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token ?? null,
    expires_in: data.expires_in,
    state,
    codeVerifier,
  }
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
  })

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!res.ok) throw new Error('Failed to refresh token')
  return res.json()
}
