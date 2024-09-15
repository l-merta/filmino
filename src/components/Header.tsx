import React, { useState } from 'react';
//import { useEffect } from 'react'

interface HeaderProps {
  cls: string,
  activeLink: string[],
  fromRoot: string
}
const Header = ({ cls, activeLink, fromRoot }: HeaderProps) => {
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('query') || "";
  
  const [searchValue, setSearchValue] = useState(query);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  return (
    <>
    <header className={cls}>
      <div className="s1">
        <a className='name' href={fromRoot+"index.html"}>Filmíno</a>
        <nav>
          <a href={fromRoot+"filmy/"} className={activeLink[0]}>Filmy</a>
          <a href={fromRoot+"serialy/"} className={activeLink[1]}>Seriály</a>
          <div className={'input-cont ' + (activeLink[0] == "" && activeLink[1] == "" ? "disabled" : "")}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder='Hledat' value={searchValue} onChange={handleInputChange}/>
          </div>
        </nav>
      </div>
      <div className="s2">
        <div className={'input-cont ' + (activeLink[0] == "" && activeLink[1] == "" ? "disabled" : "")}>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder='Hledat' value={searchValue} onChange={handleInputChange}/>
        </div>
      </div>
    </header>
    </>
  )
}

export default Header