import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'
import './styles/main.css'

import Tv from './components/Tv_app'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Tv />
  </React.StrictMode>,
)
