import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // Removido o .tsx daqui
// import './index.css' // Comente se não tiver o arquivo css ainda

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
