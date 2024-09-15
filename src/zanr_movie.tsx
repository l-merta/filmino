import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'
import './styles/main.css'

import Zanr from './components/Zanr_Movie_App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Zanr />
  </React.StrictMode>,
)
