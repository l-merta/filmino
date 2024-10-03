import React from 'react';
//import { useState } from 'react'

import Header from './Header'
import Footer from './Footer'
import SearchRes from './searchRes'
import Genres from './Genres'
import VideoSection from './VideoSection'

function Movies_App() {
  return (
    <>
      <Header cls="header-tv" activeLink={["", "a-active"]} fromRoot="../"></Header>
      <div className="searchRes-cont">
        <SearchRes type="video" dataFc={window.theMovieDb.search.getTv}></SearchRes>
        <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
      </div>
      <main className="main-video">
        <VideoSection header="Populární" iconCls={window.theMovieDb.common.getIcon("popularni", "general")} data={window.theMovieDb.tv.getPopular} sett={{language: "en"}} wrap={false}></VideoSection>
        <VideoSection header="Nejoblíbenějsí" iconCls={window.theMovieDb.common.getIcon("nejoblibenejsi", "general")} data={window.theMovieDb.tv.getTopRated} sett={{language: "en"}} wrap={false}></VideoSection>
      </main>
      <Genres movies={false}></Genres>
      <Footer></Footer>
    </>
  )
}

export default Movies_App
