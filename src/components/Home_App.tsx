import React from 'react';

import Header from './Header';
import Footer from './Footer';

function Home_App() {
  console.log(window.theMovieDb);
  //window.theMovieDb.movies.getPopular({}, (d: any)=>{console.log(JSON.parse(d))}, (d: any)=>{console.log(JSON.parse(d))});
  return (
    <>
    <Header cls="header-movie" activeLink={["", ""]} fromRoot=""></Header>
    <main className="main-home">
      <div className="header-background">
        <img src="images/movies_bg3.png" alt="" />
        <h1>FILMÍNO</h1>
        <span>FILMÍNO</span>
      </div>
      <div className="links">
        <a href="filmy/" className='filmy'>Filmy</a>
        <a href="serialy/" className='serialy'>Seriály</a>
      </div>
    </main>
    <Footer></Footer>
    {/* <NavBar defActiveLink="Domů" actSubLink="Populární"></NavBar> */}
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
export default Home_App
