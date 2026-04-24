import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

async function prepare() {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const { worker } = await import('./mocks/browser')
    await worker.start({
      serviceWorker: { url: '/mockServiceWorker.js' },
      quiet: true,
      onUnhandledRequest(request) {
        // Let browser/dev-server handle navigation/assets silently.
        if (request.mode === 'navigate' || request.destination === 'document') return
      },
    })
    return
  }

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations()
    await Promise.all(
      regs
        .filter((reg) => reg.active?.scriptURL.includes('mockServiceWorker.js'))
        .map((reg) => reg.unregister()),
    )
  }
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
