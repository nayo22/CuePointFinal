import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { FirebaseAuthListener } from './components/FirebaseAuthListener'
import { initFirebaseIfConfigured } from './lib/firebase'
import { store } from './store/store'
import './index.css'
import App from './App'

initFirebaseIfConfigured()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <FirebaseAuthListener />
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
