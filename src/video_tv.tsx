import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'
import './styles/main.css'
import './styles/video.css'

import Video from './components/Video_App_Tv'
  
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Video />
  </React.StrictMode>,
)