import React, { useEffect, useState } from 'react'

interface GenresProps {
  movies: boolean,
  active?: string
}

const Genres = ({ movies, active }: GenresProps) => {
  const [genresList, setGenresList] = useState({
    genres: [{name: "", id: ""}]
  });

  const data = movies ? window.theMovieDb.genres.getMovieList : window.theMovieDb.genres.getTvList;
  useEffect(() => {
    function s(res: any) {
      res = JSON.parse(res);
      setGenresList(res);
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }
    
    data({}, s, e);
  }, [data]);

  return (
    <>
    <div className='genres'>
      <div className="cont">
        <h3>Žánry</h3>
        <div className='genres-list'>
          {genresList.genres.map((g) => (
            <a key={g.name} href={"zanr.html?id=" + g.id + "&name=" + g.name} className={"genre-" + (movies ? "movie" : "tv") + " " + (active == g.id ? "genre-active-"+(movies ? "movie" : "tv") : "")}>
              <i className={window.theMovieDb.common.getIcon(g.id, (movies ? "movies" : "tv"))}></i>
              <span>{g.name}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default Genres