import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoreProvider } from 'store/main'
import 'styles/commons.css'
import 'styles/variables.css'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>
)