import React, { useEffect, useState} from 'react';
//import { useEffect } from 'react';
//import { useNavigate } from 'react-router-dom';
//import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Header from './Header'
import Footer from './Footer'
import SearchRes from './searchRes'
import Genres from './Genres'
import VideoSection from './VideoSection'
import Collection from './Collection'

function Search_App() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId: any = [];
  const splt = window.location.pathname.split("/")
  videoId.push(splt[splt.length-2]);
  videoId.push(urlParams.get('type'));
  videoId.push(urlParams.get('query'));

  const [videoIds, setVideoIds] = useState<number[]>([]);
  const [collectionsRendered, setCollectionsRendered] = useState(0);
  const [allCollectionsLoaded, setAllCollectionsLoaded] = useState(false); // New state
  
  const [collectionData, setCollectionData] = useState({
    results: [{
      id: ""
    }]
  });
  const totalCollections = collectionData.results.length; // Assuming you have this data available

  const data = window.theMovieDb.search.getCollection;
  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      console.log(res);
      setCollectionData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
      
    data({query: videoId[2]}, s, e);
  }, [data]);

  function callVideoIds(idArr: any) {
    setVideoIds((prevIds: any) => {
      return [...prevIds, ...idArr];
    });

    setCollectionsRendered((prevCount) => {
      const newCount = prevCount + 1;
      if (newCount === totalCollections) {
        setAllCollectionsLoaded(true); // All collections have finished loading
      }
      return newCount;
    });
  }
  
  return (
    <>
      <Header cls="header-movie" activeLink={["a-active", ""]} fromRoot="../"></Header>
      <div className="searchRes-cont">
        <SearchRes type="video" dataFc={window.theMovieDb.search.getMovie}></SearchRes>
        <SearchRes type="herec" dataFc={window.theMovieDb.search.getPerson}></SearchRes>
      </div>
      <main className="main-video">
        <a className='back' href="javascript:history.back()">
          <i className="fa-solid fa-arrow-left"></i>
          <span>Zpět</span>
        </a>
        {videoId[1] === "video" ?
        <>
          <h2 className='h2-header'>
            <div>
              <i className={window.theMovieDb.common.getIcon("hledat", "general")}></i> {"Hledat film '" + videoId[2] + "'"}
            </div> 
          </h2>
          {collectionData.results[0].id !== "" ? 
            collectionData.results.map((r) => (
              <Collection id={r.id} callVideoIds={callVideoIds} key={r.id}/>
            ))
          : ""}
          {allCollectionsLoaded && ( // Render VideoSection only after all collections have loaded
            <VideoSection
              header={""}
              iconCls={window.theMovieDb.common.getIcon("", "general")}
              data={window.theMovieDb.search.getMovie}
              sett={{page: 1, language: "en", query: videoId[2]}}
              wrap={true}
              exclude={videoIds}
            />
          )}
        </> : (videoId[1] === "herec" ?
          <VideoSection
            header={"Hledat herce '" + videoId[2] + "'"}
            iconCls={window.theMovieDb.common.getIcon("hledat", "general")}
            data={window.theMovieDb.search.getPerson}
            sett={{page: 1, language: "en", query: videoId[2]}}
            wrap={true}
            type="herec"
          />
        : "")}
      </main>
      <Genres movies={true}></Genres>
      <Footer></Footer>
    </>
  )
}

export default Search_App
