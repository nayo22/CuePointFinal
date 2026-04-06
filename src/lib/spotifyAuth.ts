import {
  createCodeChallenge,
  createCodeVerifier,
} from './spotifyPkce'
import { getSpotifyClientId, getSpotifyRedirectUri } from './spotifyConfig'
import { clearSpotifyTokens, storePkceVerifier } from './spotifyTokens'

const SPOTIFY_SCOPES = ['user-read-email', 'user-read-private'].join(' ')

export function beginSpotifyLogin(opts?: { showDialog?: boolean }): boolean {
  const clientId = getSpotifyClientId()
  if (!clientId) return false
  const verifier = createCodeVerifier()
  storePkceVerifier(verifier)
  void createCodeChallenge(verifier).then((challenge) => {
    const p = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: SPOTIFY_SCOPES,
      redirect_uri: getSpotifyRedirectUri(),
      code_challenge_method: 'S256',
      code_challenge: challenge,
    })
    if (opts?.showDialog) p.set('show_dialog', 'true')
    window.location.assign(
      `https://accounts.spotify.com/authorize?${p.toString()}`,
    )
  })
  return true
}

export function disconnectSpotify() {
  clearSpotifyTokens()
}

export { isSpotifyConfigured } from './spotifyConfig'
