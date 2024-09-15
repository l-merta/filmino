import React, { useEffect, useState } from 'react'

import VideoSection from './VideoSection'

interface CollectionProps {
  id: string,
  callVideoIds: any
}

const Collection = ({ id, callVideoIds }: CollectionProps) => {
  const [error, setError] = useState(false);
  const [colData, setColData] = useState({
    poster_path: "",
    backdrop_path: "",
    name: "",
    overview: "",
    parts: []
  });
  //
  const data = window.theMovieDb.collections.getDetails;
  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      console.log(res);
      callVideoIds(res.parts.map((p: any) => p.id));
      setColData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
      setError(true);
      callVideoIds([]);
    }
      
    data({id: id}, s, e);
  }, [data]);

  return (
    <>
    {!error ? <div className="collection">
      <div className="info">
        <div className="imgCont">
          <img src={window.theMovieDb.common.images_uri + colData.poster_path} alt="" />
        </div>
        <div className="text">
          <h2>{colData.name}</h2>
          <p>{colData.overview}</p>
        </div>
      </div>
      <VideoSection header={""} iconCls={window.theMovieDb.common.getIcon("", "general")} data={window.theMovieDb.collections.getDetails} sett={{id: id, page: 1, language: "en"}} wrap={true} size="medium" results="parts"></VideoSection>
    </div> : ""}
    </>
  )
}

export default Collection