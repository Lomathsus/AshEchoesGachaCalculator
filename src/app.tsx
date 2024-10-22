import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import router from '@/renderer/router'

import './reset.css'

function App() {
  return <RouterProvider router={router} />
}

const rootElement = document.getElementById('root')
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
} else {
  console.error('Root element not found')
}
