import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'
import './styles/main.css'

import Movies from './components/Movies_App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Movies />
  </React.StrictMode>,
)
