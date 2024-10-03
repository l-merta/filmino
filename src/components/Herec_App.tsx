import React, { useEffect, useState } from 'react';

import VideoSection from './VideoSection'

function Herec_App() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId: any = [];
  const splt = window.location.pathname.split("/")
  videoId.push(splt[splt.length-2]);
  videoId.push(urlParams.get('id'));

  const [actorData, setActorData] = useState({
    name: "",
    profile_path: "",
    birthday: "--",
    deathday: "",
    place_of_birth: ""
  });

  const data = window.theMovieDb.people.getById;
  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      console.log(res);
      document.title = "Filmíno - " + res.name;
      setActorData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
    
    data({id: videoId[1]}, s, e);
  }, [data]);

  return (
    <>
    <a className='back' href="javascript:history.back()">
      <i className="fa-solid fa-arrow-left"></i>
      <span>Zpět</span>
    </a>
    <div className="actorInfo">
      <div className="imgCont">
        <img src={window.theMovieDb.common.images_uri + actorData.profile_path} alt=" " />
      </div>
      <div className="info">
        <h1>{actorData.name}</h1>
        {actorData.birthday ? <h4>{actorData.birthday.split("-")[2] + ". " + actorData.birthday.split("-")[1] + ". " + actorData.birthday.split("-")[0] + " - " + (actorData.deathday ? actorData.deathday.split("-")[2] + ". " + actorData.deathday.split("-")[1] + ". " + actorData.deathday.split("-")[0] : "")}</h4> : ""}
        <h4>{actorData.place_of_birth}</h4>
      </div>
    </div>
    <VideoSection header="Filmy" iconCls={window.theMovieDb.common.getIcon("film", "general")} data={window.theMovieDb.people.getMovieCredits} sett={{id: videoId[1], page: 1, language: "en"}} wrap={true} results="cast" videoLink={videoId[0] == "filmy" ? "" : "../filmy/"}></VideoSection>
    <VideoSection header="Seriály" iconCls={window.theMovieDb.common.getIcon("serial", "general")} data={window.theMovieDb.people.getTvCredits} sett={{id: videoId[1], page: 1, language: "en"}} wrap={true} results="cast" videoLink={videoId[0] == "serialy" ? "" : "../serialy/"}></VideoSection>
    </>
  )
}

export default Herec_App
