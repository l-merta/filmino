import React from 'react';
//import { useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './Header'
import Footer from './Footer'
import SearchRes from './searchRes'
import Genres from './Genres'
import VideoSection from './VideoSection'

function Zanr_App() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId: any = [];
  const splt = window.location.pathname.split("/")
  videoId.push(splt[splt.length-2]);
  videoId.push(urlParams.get('id'));
  videoId.push(urlParams.get('name'));
  
  return (
    <>
      <Header cls="header-movie" activeLink={["a-active", ""]} fromRoot="../"></Header>
      <div className="searchRes-cont">
        <SearchRes type="video" dataFc={window.theMovieDb.search.getMovie}></SearchRes>
        <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
      </div>
      <main className="main-video">
        <VideoSection header={videoId[2]} iconCls={window.theMovieDb.common.getIcon(videoId[1], "movies")} data={window.theMovieDb.discover.getMovies} sett={{page: 1, language: "en", with_genres: videoId[1]}} wrap={false}></VideoSection>
      </main>
      <Genres movies={true} active={videoId[1]}></Genres>
      <Footer></Footer>
    </>
  )
}

export default Zanr_App
