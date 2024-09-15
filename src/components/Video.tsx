import React from 'react';
import { useState } from 'react'

interface VideoProps {
  title: string,
  imgSrc: string,
  link: string
}
const Video = ({ title, imgSrc, link }: VideoProps) => {
  const [hasLoaded, setHasLoaded] = useState(true);

  const handleError = () => {
    setHasLoaded(false);
  };
  return (
    <>
    <a href={link} className='video'>
      <div className="imgCont">
        <i className="fa-regular fa-image-slash"></i>
        <img src={imgSrc} alt="Obrázek filmu" onError={handleError} className={!hasLoaded ? "img-noLoad" : ""}/>
      </div>
      <h4 className="title">{title}</h4>
    </a>
    </>
  )
}

export default Video