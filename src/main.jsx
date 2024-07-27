import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {Toaster} from 'react-hot-toast'
import { MetaMaskProvider } from '@metamask/sdk-react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MetaMaskProvider>
    <Toaster/>
    <App />
  </MetaMaskProvider>
  </React.StrictMode>,
)
