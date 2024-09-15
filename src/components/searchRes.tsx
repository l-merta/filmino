import React, { useEffect, useState } from 'react';

interface searchResProps {
  type: string;
  dataFc: any;
}

const SearchRes = ({ type, dataFc }: searchResProps) => {
  const videoId: any = [];
  const splt = window.location.pathname.split("/");
  videoId.push(splt[splt.length - 2]);

  const [showRes, setShowRes] = useState(false);
  const [query, setQuery] = useState("");

  const [queryData, setQueryData] = useState({
    results: [{
      id: "",
      poster_path: "",
      original_title: "",
      profile_path: "",
      title: "",
      name: "",
      original_name: "",
      vote_average: 0,
      vote_count: 0
    }],
    total_results: 0
  });

  const getSearchInputSelector = () => {
    return window.matchMedia("(min-width: 850px)").matches
      ? 'header .s1 .input-cont input'
      : 'header .s2 .input-cont input';
  };

  useEffect(() => {
    const searchInputSelector = getSearchInputSelector();
    const searchInput = document.querySelector(searchInputSelector) as HTMLInputElement;

    if (searchInput) {
      const handleChange = () => {
        setQuery(searchInput.value);

        if (searchInput.value.length > 0) {
          setShowRes(true);
        } else {
          setShowRes(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Enter" && searchInput.value.length > 0 && queryData.results.length > 0) {
          if (queryData.results[0].id !== "") {
            window.location.href = `search.html?type=${type}&query=${searchInput.value}`;
          }
        }
      };

      searchInput.addEventListener('input', handleChange);
      searchInput.addEventListener('keydown', handleKeyDown);

      // Cleanup event listener on component unmount
      return () => {
        searchInput.removeEventListener('input', handleChange);
        searchInput.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [type, queryData]);

  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      console.log(res);
      setQueryData(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }

    if (query.length > 0) {
      const data_query = dataFc;

      data_query({ query: query }, s, e);
    }
  }, [query]);

  return (
    <>
      <div key={type} className={'searchRes ' + (!showRes ? "disabled" : "")}>
        {queryData.results.map((r, index) => (
          index <= 4 ? (
            <a key={index + "" + r.vote_average} className="result" href={type + ".html?id=" + r.id}>
              <div className="imgCont">
                <img src={window.theMovieDb.common.images_uri + (type === "video" ? r.poster_path : (type === "herec" ? r.profile_path : ""))} alt="" />
              </div>
              <div className="nameCont">
                <h3>{type === "video" ? (videoId[0] === "filmy" ? r.original_title : r.original_name) : (type === "herec" ? r.name : "")}</h3>
                <h4>{type === "video" ? (videoId[0] === "filmy" ? r.title : r.name) : ""}</h4>
              </div>
              {type === "video" ? (
                <div className="ratingCont">
                  <div>{r.vote_count > 0 ? Math.round(r.vote_average * 10) / 10 : "NR"}</div>
                </div>
              ) : ""}
            </a>
          ) : ""
        ))}
        {queryData.results.length > 5 ? <a className='showAll' href={"search.html?type=" + type + "&query=" + query}>Všechny výsledky <span>{queryData.total_results}</span></a> : ""}
      </div>
    </>
  );
}

export default SearchRes;
