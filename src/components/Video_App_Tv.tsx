//import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import React from 'react';
import { useEffect, useState } from "react"

import Header from './Header'
import Footer from './Footer'
import SearchRes from './searchRes'
import VideoSection from './VideoSection'

function Video_App_Tv() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId: any = [];
  const splt = window.location.pathname.split("/")
  videoId.push(splt[splt.length-2]);
  videoId.push(urlParams.get('id'));
  //
  const isMovie = videoId[0] == "filmy";
  //
  const [imgLoaded, setImgLoaded] = useState(true);
  const [providersLinks, setProvidersLinks] = useState(['']);
  const [videoData, setVideoData] = useState({
    name: "",
    original_name: "",
    status: "",
    poster_path: "",
    backdrop_path: "",
    tagline: "",
    overview: "",
    genres: [{name: "", id: ""}],
    seasons: [],
    number_of_episodes: "",
    first_air_date: "",
    last_air_date: "",
    production_companies: [{name: ""}],
    vote_average: 0,
    vote_count: 0
  });
  const [trailerData, setTrailerData] = useState({
    results: [{key: ""}]
  })
  const [providersData, setProvidersData] = useState({
    lang: "",
    result: {
      buy: [
        {
          logo_path: "",
          provider_name: ""
        }
      ]
    }
  });
  const [reviewsData, setReviewsData] = useState({
    results: [
      {
        author: "",
        author_details: {
          rating: ""
        },
        created_at: "",
        content: ""
      }
    ]
  });

  const data = window.theMovieDb.tv.getById;
  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      console.log(res);
      findTvLinks(res.original_name, res.name, res.first_air_date.split("-")[0]);
      setVideoData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
    
    data({id: videoId[1]}, s, e);
  }, [data]);
  //
  const data_trailer = window.theMovieDb.tv.getVideos;
  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      setTrailerData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
    
    data_trailer({id: videoId[1]}, s, e);
  }, [data_trailer]);
  //
  const data_providers = window.theMovieDb.tv.getProviders;
  useEffect(() => {
    function s(res: any) {
      //res = res.results.CZ ? {lang: "CZ", result: res.results.CZ} : (res.results.US ? {lang: "US", result: res.results.US} : {}); -- cz nebo us
      res = res.results.US ? {lang: "US", result: res.results.US} : null; // -- jenom us
      setProvidersData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
    
    data_providers({id: videoId[1]}, s, e);
  }, [data_providers]);
  //
  const data_reviews = window.theMovieDb.tv.getReviews;
  useEffect(() => {
    function s(res: any) {
      //res = res.results.CZ ? {lang: "CZ", result: res.results.CZ} : (res.results.US ? {lang: "US", result: res.results.US} : {}); -- cz nebo us
      //res = res.results.US ? {lang: "US", result: res.results.US} : null; // -- jenom us
      console.log(res);
      setReviewsData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
    
    data_reviews({id: videoId[1]}, s, e);
  }, [data_reviews]);

  function handleReadMoreOnClick(event: any) {
    event.currentTarget.parentElement.parentElement.classList.remove("review-small");
    event.currentTarget.parentElement.remove();
  };

  async function findTvLinks(tveName_original: string, tvName: string, year: string) {
    const formattedTvName_original = formatName(tveName_original);
    const formattedTvName = formatName(tvName);

    function formatName(name: string) {
      const formattedName = name.toLowerCase()
        .normalize("NFD") // Normalize to separate the diacritic marks
        .replace(/[\u0300-\u036f]/g, '') // Remove the diacritic marks
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9\s-]/g, '') // Remove unwanted characters (keep only letters, numbers, spaces, and hyphens)
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .trim(); // Trim any trailing spaces or hyphens

      return formattedName;
    }

    const links: any = [];
    //svetserialu
    links.push(await svetserialu());
    async function svetserialu() {
      const rootLink = "https://svetserialu.io/serial/";
      let link;
      //
      link = rootLink + formattedTvName_original + "-" + year.split("-")[0];
      let response = await fetch(link, { method: 'GET' });

      if (!response.ok) {
        link = rootLink + formattedTvName_original;
        response = await fetch(link, { method: 'GET' });
  
        if (!response.ok) {
          return "";
        }
      }
  
      // If the response is OK and not redirected, return the link
      if (response.ok) {
        return link;
      }
    }

    setProvidersLinks(links);
  }

  return (
    <>
    <Header cls="header-tv" activeLink={[(isMovie ? "a-active" : ""), (!isMovie ? "a-active" : "")]} fromRoot="../"></Header>
    <div className="searchRes-cont">
      <SearchRes type="video" dataFc={window.theMovieDb.search.getTv}></SearchRes>
      <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
    </div>
    <main className="main-video-info">
      <a className='back' href="javascript:history.back()">
        <i className="fa-solid fa-arrow-left"></i>
        <span>Zpět</span>
      </a>
      <div className="inInfo">
        <div className='imgCont'>
        <img className={!imgLoaded ? "" : ""} src={window.theMovieDb.common.images_uri + videoData.poster_path} alt="" onError={()=>{setImgLoaded(false)}}/>
        </div>
        <div className="info">
          <div className="s1">
            <div className="s11">
              <span className="type">Seriál <span className="runtime">{videoData.seasons.length} sérií | {videoData.number_of_episodes} epizod</span></span>
              <h1>{videoData.original_name}</h1>
              {videoData.original_name != videoData.name ? <h2>{videoData.name}</h2> : ""}
              <div className="genres-list">
                <span className="year">{videoData.first_air_date ? videoData.first_air_date.split("-")[0] : ""} - {videoData.status == "Ended" ? (videoData.last_air_date ? videoData.last_air_date.split("-")[0] : "") : ""}</span>
                {videoData.genres.map((g) => (
                  <a key={g.name} href={"zanr.html?id=" + g.id + "&name=" + g.name} className="genre genre-tv">{g.name}</a>
                ))}
              </div>
            </div>
            <div className="addInfo">
              {videoData.production_companies.length > 0 ? <span className="producer">{videoData.production_companies[0].name}</span> : ""}
              <div className="score">
                <div className="circle">{videoData.vote_count > 0 ? Math.round(videoData.vote_average * 10) / 10 : "NR"}</div>
              </div>
            </div>
          </div>
          <div className="s2">
            {videoData.tagline.length > 0 ? <span className="tagline">„{videoData.tagline}“</span> : ""}
            <p className="popis">{videoData.overview}</p>
          </div>
        </div>
      </div>
      {providersLinks[0] != '' ? 
      <>
      <h2><i className={window.theMovieDb.common.getIcon("stream", "general")}></i> Ke zhlédnutí</h2>
      <div className='streamPlatform-cont'>
        {providersLinks[0] != '' ? <a className='streamPlatform streamPlatform-small' href={providersLinks[0]} target="_blank">
          <img src="../images/svetserialu_logo.svg" alt="" />
          {/* <h4>Svetserialu</h4> */}
        </a> : ""}
      </div>
      </>
      : ""}
      {trailerData.results[0] ? (
        <>
        <h2><i className={window.theMovieDb.common.getIcon("trailer", "general")}></i> Trailer</h2>
        <iframe src={"https://www.youtube.com/embed/" + trailerData.results[0].key}></iframe>
      </>) : ""}
      {reviewsData != null && reviewsData.results.length ? (
        <>
        <h2><i className={window.theMovieDb.common.getIcon("recenze", "general")}></i> Recenze</h2>
        <div className='reviews-cont'>
          {reviewsData.results.map((p, index) => (
            index <= 4 ? (
            <div key={p.author} className={'review ' + (p.content.length > 600 ? "review-small" : "")}>
              <div className="name">
                <h4>{p.author}</h4>
                {p.author_details.rating ? <span>hodnotil {p.author_details.rating}</span> : ""}
              </div>
              <span className='date'>{window.theMovieDb.common.getDateFormat(p.created_at)}</span>
              <p>{p.content}</p>
              {p.content.length > 600 ? <div className='hider'>
                <button onClick={handleReadMoreOnClick}>Číst dále</button>
              </div> : ""}
            </div>) : ""
          ))}
        </div>
      </>) : ""}
      <div className="gap"></div>
      <VideoSection header="Herci" iconCls={window.theMovieDb.common.getIcon("herci", "general")} data={window.theMovieDb.tv.getCredits} sett={{language: "en", id: videoId[1]}} wrap={true} results="cast" type="herec" size="small"></VideoSection>
      <VideoSection header="Podobné seriály" iconCls={window.theMovieDb.common.getIcon("nejoblibenejsi", "general")} data={window.theMovieDb.tv.getSimilar} sett={{language: "en", id: videoId[1]}} wrap={false}></VideoSection>
    </main>
    <Footer></Footer>
    </>
  )
}

//
interface TheMovieDb {
  [key: string]: any;
}
declare global {
  interface Window {
    theMovieDb: TheMovieDb;
  }
}
export default Video_App_Tv