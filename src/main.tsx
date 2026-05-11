import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { FirebaseAuthListener } from './components/FirebaseAuthListener'
import { InboxRefresher } from './components/InboxRefresher'
import { initFirebaseIfConfigured } from './lib/firebase'
import { scrubLegacySpotifyKeys } from './lib/spotifyTokens'
import { store } from './store/store'
import './index.css'
import App from './App'

initFirebaseIfConfigured()
scrubLegacySpotifyKeys()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <FirebaseAuthListener />
        <InboxRefresher />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
