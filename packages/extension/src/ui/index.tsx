import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import { App } from './App'

const container = document.getElementById('root')
if (!container) {
  throw new Error('No root element found')
}

const root = createRoot(container)

root.render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
