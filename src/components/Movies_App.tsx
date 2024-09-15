import React from 'react';
//import { useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './Header'
import Footer from './Footer'
import SearchRes from './searchRes'
import Genres from './Genres'
import VideoSection from './VideoSection'

function Movies_App() {
  /*
  const redirectIfFilmyId = () => {
    //const path = window.location.pathname;
    const splt = document.referrer.split("/");
    const videoId = [];
    videoId.push(splt[splt.length-2]);
    videoId.push(splt[splt.length-1]);
    //history.replaceState(null, '', '/'+videoId[0]+'/'+videoId[1]);

    console.log(videoId);
    if (videoId[1].length > 0) {
      window.location.href = '/video.html';
    }
  };
  window.addEventListener('popstate', redirectIfFilmyId);
  redirectIfFilmyId();
  */
  

  return (
    <>
      <Header cls="header-movie" activeLink={["a-active", ""]} fromRoot="../"></Header>
      <div className="searchRes-cont">
        {/* <SearchRes type="herec" dataFc={window.theMovieDb.search.getCompany}></SearchRes> */}
        <SearchRes type="video" dataFc={window.theMovieDb.search.getMovie}></SearchRes>
        <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
      </div>
      <main className="main-video">
        <VideoSection header="Populární" iconCls={window.theMovieDb.common.getIcon("popularni", "general")} data={window.theMovieDb.movies.getPopular} sett={{page: 1, language: "en"}} wrap={false}></VideoSection>
        <VideoSection header="Nadcházející" iconCls={window.theMovieDb.common.getIcon("nadchazejici", "general")} data={window.theMovieDb.movies.getUpcoming} sett={{language: "en"}} wrap={false}></VideoSection>
        <VideoSection header="Nejoblíbenější" iconCls={window.theMovieDb.common.getIcon("nejoblibenejsi", "general")} data={window.theMovieDb.movies.getTopRated} sett={{language: "en"}} wrap={false}></VideoSection>
        {/* <VideoSection header="Objevte nové" iconCls="fa-regular fa-sparkles" data={window.theMovieDb.discover.getMovies} sett={{language: "en", with_genres: "27"}}></VideoSection> */}
      </main>
      <Genres movies={true}></Genres>
      <Footer></Footer>
    </>
  )
}

export default Movies_App
