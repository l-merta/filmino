import React from 'react'
import ReactDOM from 'react-dom/client'

import './styles/index.css'
import './styles/main.css'

import Header from './components/Header'
import Footer from './components/Footer'
import SearchRes from './components/searchRes'
import Genres from './components/Genres'
import Herec from './components/Herec_App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Header cls="header-tv" activeLink={["", "a-active"]} fromRoot="../"></Header>
    <div className="searchRes-cont">
      <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
      <SearchRes type="video" dataFc={window.theMovieDb.search.getTv}></SearchRes>
    </div>
    <main className="main-video">
      <Herec />
    </main>
    <Genres movies={true}></Genres>
    <Footer></Footer>
  </React.StrictMode>,
)
