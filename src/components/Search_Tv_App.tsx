import React from 'react';
//import { useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './Header'
import Footer from './Footer'
import SearchRes from './searchRes'
import Genres from './Genres'
import VideoSection from './VideoSection'

function Search_App() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId: any = [];
  const splt = window.location.pathname.split("/")
  videoId.push(splt[splt.length-2]);
  videoId.push(urlParams.get('type'));
  videoId.push(urlParams.get('query'));
  
  return (
    <>
      <Header cls="header-tv" activeLink={["", "a-active"]} fromRoot="../"></Header>
      <div className="searchRes-cont">
        <SearchRes type="video" dataFc={window.theMovieDb.search.getTv}></SearchRes>
        <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
      </div>
      <main className="main-video">
        <a className='back' href="javascript:history.back()">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Zpět</span>
        </a>
        {videoId[1] == "video" ?
        <VideoSection header={"Hledat seriál '" + videoId[2] + "'"} iconCls={window.theMovieDb.common.getIcon("hledat", "general")} data={window.theMovieDb.search.getTv} sett={{page: 1, language: "en", query: videoId[2]}} wrap={true}></VideoSection>
        : (videoId[1] == "herec" ?
          <VideoSection header={"Hledat herce '" + videoId[2] + "'"} iconCls={window.theMovieDb.common.getIcon("hledat", "general")} data={window.theMovieDb.search.getPerson} sett={{page: 1, language: "en", query: videoId[2]}} wrap={true} type="herec"></VideoSection>
        : "")}
      </main>
      <Genres movies={true}></Genres>
      <Footer></Footer>
    </>
  )
}

export default Search_App
