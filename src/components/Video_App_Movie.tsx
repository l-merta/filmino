//import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'
import React, { useEffect, useState } from "react"

import Header from './Header'
import Footer from './Footer'
import SearchRes from './searchRes'
import VideoSection from './VideoSection'

function Video_App_Movie() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId: any = [];
  const splt = window.location.pathname.split("/")
  videoId.push(splt[splt.length-2]);
  videoId.push(urlParams.get('id'));
  //
  const [imgLoaded, setImgLoaded] = useState(true);
  const [providersLinks, setProvidersLinks] = useState(['', '', '']);
  const [videoData, setVideoData] = useState({
    title: "",
    original_title: "",
    poster_path: "",
    backdrop_path: "",
    tagline: "",
    overview: "",
    genres: [{name: "", id: ""}],
    runtime: "",
    release_date: "",
    vote_average: 0,
    vote_count: 0,
    production_companies: [{name: ""}]
  });
  const [trailerData, setTrailerData] = useState({
    results: [{key: ""}]
  });
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

  const data = window.theMovieDb.movies.getById;
  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      console.log(res);
      setVideoData(res);
      findMovieLinks(res.original_title, res.title, res.release_date);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
    
    data({id: videoId[1]}, s, e);
  }, [data]);
  //
  const data_trailer = window.theMovieDb.movies.getVideos;
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
  const data_providers = window.theMovieDb.movies.getProviders;
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
  const data_reviews = window.theMovieDb.movies.getReviews;
  useEffect(() => {
    function s(res: any) {
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
  //
  async function findMovieLinks(movieName_original: string, movieName: string, year: string) {
    const formattedMovieName_original = formatName(movieName_original);
    const formattedMovieName = formatName(movieName);

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
    //bombuj
    links.push(await bombuj());
    async function bombuj() {
      const rootLink = "https://www.bombuj.si/online-film-";
      let link;
      //
      link = rootLink + formattedMovieName + "-" + year.split("-")[0];
      let response = await fetch(link, { method: 'HEAD' });

      if (response.url === 'https://www.bombuj.si/' || !response.ok) {
        link = rootLink + formattedMovieName;
        //console.log(link);
        response = await fetch(link, { method: 'HEAD' });
  
        if (response.url === 'https://www.bombuj.si/' || !response.ok) {
          return "";
        }
      }
  
      // If the response is OK and not redirected, return the link
      if (response.ok && response.url !== 'https://www.bombuj.si/') {
        return link;
      }
    }
    //kukaj
    links.push(await kukaj());
    async function kukaj() {
      const rootLink = "https://film.kukaj.me/";
      let link;
      //
      link = rootLink + formattedMovieName + "-" + year.split("-")[0];
      let response = await fetch(link, { method: 'GET' });

      if (!response.ok) {
        link = rootLink + formattedMovieName;
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
  //
  return (
    <>
    <Header cls="header-movie" activeLink={["a-active", ""]} fromRoot="../"></Header>
    <div className="searchRes-cont">
        <SearchRes type="video" dataFc={window.theMovieDb.search.getMovie}></SearchRes>
        <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
      </div>
    <main className="main-video-info">
      <a className='back' href="javascript:history.back()">
        <i className="fa-solid fa-arrow-left"></i>
        <span>Zpět</span>
      </a>
      <div className="inInfo">
        <div className='imgCont'>
          <img className={imgLoaded ? "" : ""} src={window.theMovieDb.common.images_uri + videoData.poster_path} alt="" onError={()=>{setImgLoaded(false)}}/>
        </div>
        <div className="info">
          <div className="s1">
            <div className="s11">
              <span className="type">Film <span className="runtime">{videoData.runtime} min</span></span>
              <h1>{videoData.original_title}</h1>
              {videoData.original_title != videoData.title ? <h2>{videoData.title}</h2> : ""}
              <div className="genres-list">
                <span className="year">{videoData.release_date.split("-")[0]}</span>
                {videoData.genres.map((g) => (
                  <a key={g.name} href={"zanr.html?id=" + g.id + "&name=" + g.name} className="genre genre-movie">{g.name}</a>
                ))}
              </div>
            </div>
            <div className="addInfo">
              {videoData.production_companies[0] ? <span className="producer">{videoData.production_companies[0].name}</span> : ""}
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
      {providersLinks[0] != '' || providersLinks[1] != ''  || providersLinks[1] != '' ? 
      <>
      <h2><i className={window.theMovieDb.common.getIcon("stream", "general")}></i> Ke zhlédnutí</h2>
      <div className='streamPlatform-cont'>
        {providersLinks[0] != '' ? <a className='streamPlatform' href={providersLinks[0]} target="_blank">
          <img src="../images/bombuj_logo.png" alt="" />
          {/* <h4>Bombuj</h4> */}
        </a> : ""}
        {providersLinks[1] != '' ? <a className='streamPlatform' href={providersLinks[1]} target="_blank">
          <img src="../images/kukaj_logo.png" alt="" />
          {/* <h4>Kukaj</h4> */}
        </a> : ""}
        {providersLinks[2] ? <a className='streamPlatform' href={providersLinks[2]} target="_blank">
          <img src="../images/prehrajto_logo.png" alt="" />
          {/* <h4>Přehraj to</h4> */}
        </a> : ""}
      </div>
      </>
      : ""}
      {trailerData.results[0] ? (
        <>
        <h2><i className={window.theMovieDb.common.getIcon("trailer", "general")}></i> Trailer</h2>
        <iframe src={"https://www.youtube.com/embed/" + trailerData.results[0].key} allow="fullscreen;"></iframe>
      </>) : ""}
      {/* {providersData != null && providersData.result.buy ? (
        <>
        <h2><i className={window.theMovieDb.common.getIcon("stream", "general")}></i> Ke zhlédnutí</h2>
        <div className='streamPlatform-cont'>
          {providersData.result.buy.map((p, index) => (
            index <= 3 ? (
            <div key={p.provider_name} className='streamPlatform'>
              <img src={window.theMovieDb.common.images_uri + p.logo_path} alt="Obrázek streamovací platformy" />
              <h4>{p.provider_name}</h4>
            </div>) : ""
          ))}
        </div>
      </>) : ""} */}
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
      <VideoSection header="Herci" iconCls={window.theMovieDb.common.getIcon("herci", "general")} data={window.theMovieDb.movies.getCredits} sett={{language: "en", id: videoId[1]}} wrap={true} results="cast" type="herec" size="small"></VideoSection>
      <VideoSection header="Podobné filmy" iconCls={window.theMovieDb.common.getIcon("nejoblibenejsi", "general")} data={window.theMovieDb.movies.getSimilarMovies} sett={{language: "en", id: videoId[1]}} wrap={false}></VideoSection>
    </main>
    <Footer></Footer>
    </>
  )
}
export default Video_App_Movie