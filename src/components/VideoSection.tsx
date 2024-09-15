import React from 'react';
import { useState, useEffect } from 'react';

import Video from './Video'
import Video_load from './Video_load'
import VideoCont from './videoCont'

interface VideoSectionProps {
  header: string;
  iconCls: string;
  data: any;
  sett: any;
  wrap: any;
  type?: any;
  results?: any;
  videoLink?: any;
  size?: any;
  exclude?: any;
}

const VideoSection = ({ header, iconCls, data, sett, wrap, type, results, videoLink, size, exclude }: VideoSectionProps) => {
  const [totalPages, setTotalPages] = useState(1);
  const [foundVid, setFoundVid] = useState([<Video_load key="loading" />]);
  const [vidChunks, setVidChunks] = useState([foundVid]);
  const [videoContChildren, setVideoContChildren] = useState([]);
  const vidChunkSize = 10;
  const [vidContIndex, setVidContIndex] = useState(0);
  const [hideMoreCls, setHideMoreCls] = useState("");

  if (type == undefined) type = "video";
  if (results == undefined) results = "results";
  if (videoLink == undefined) videoLink = "";
  if (size == undefined) size = "";
  if (exclude == undefined) exclude = [];

  const generateUniqueRandomNumbers = (count: number, max: number) => {
    if (max > totalPages) {
      max = totalPages;
    }
    if (count > max) {
      count = max;
    }
    
    const numbers = new Set<number>();
    while (numbers.size < count) {
      const randomNum = Math.floor(Math.random() * max) + 1;
      numbers.add(randomNum);
    }
    return Array.from(numbers);
  };

  // Fetch data for a specific page
  const fetchData = (page: number, initial: boolean) => {
    function s(res: any) {
      if(typeof res == "string")
        res = JSON.parse(res);
      
      //
      if(results == "results")
        res.results.sort((a: any, b: any) => b.popularity - a.popularity);
      if(results == "cast")
        res.cast.sort((a: any, b: any) => b.popularity - a.popularity);
      //

      if(initial) {
        setFoundVid([]);
        setTotalPages(res.total_pages);
      }

      function pushMovie(md: any) {
        const title = md.title !== undefined ? md.title : md.name;
        const newVid = (
          <Video
            key={md.id}
            title={title}
            imgSrc={window.theMovieDb.common.images_uri + (type == "herec" ? md.profile_path : md.poster_path)}
            link={videoLink + type + ".html?id=" + md.id}
          />
        );
        fVids.push(newVid);
      }

      const fVids: any = [];
      if(results == "results") {
        if (res.results !== undefined) {
          res.results.forEach((r: any) => {
            pushMovie(r);
          });
        } else {
          pushMovie(res);
        }
      }
      else if(results == "cast") {
        if (res.cast !== undefined) {
          res.cast.forEach((r: any) => {
            pushMovie(r);
          });
        } else {
          pushMovie(res);
        }
      }
      else if(results == "parts") {
        if (res.parts !== undefined) {
          res.parts.forEach((r: any) => {
            pushMovie(r);
          });
        } else {
          pushMovie(res);
        }
      }

      setFoundVid((prevFoundVid) => {
        const updatedVids = [...prevFoundVid, ...fVids];
        const vidRes = [];
        for (let i = 0; i < updatedVids.length; i += vidChunkSize) {
          const chunk = updatedVids.slice(i, i + vidChunkSize);
          vidRes.push(chunk);
        }
        setVidChunks(vidRes);
        addVideoCont(vidRes);
        return updatedVids;
      });
    }

    function e(error: any) {
      console.error("Error fetching data:", error);
    }

    if (data.length === 2) data(s, e, page);
    else if (data.length === 3) data({ ...sett, page }, s, e);
  };

  //
  useEffect(() => {
    fetchData(1, true);
  }, [data]);
  // Fetch the first 10 pages on mount
  useEffect(() => {
    if (totalPages > 1) {
      const randNumArr = generateUniqueRandomNumbers(30, 500);
      randNumArr.forEach((page) => fetchData(page, false));
    }
    /*
    for (let i = 2; i <= 10; i++) {
      fetchData(i, false);
    }
    */
    //console.log(vidChunks);
  }, [data, totalPages]);

  function addVideoCont(vc: any) {
    const index = vidContIndex;
    setVidContIndex(index + 1);
  
    if (vc[index] && (vc[index].length > 8 || wrap)) {
      // Create a new array with the updated content
      const newVidContChildren: any = [...videoContChildren, <VideoCont size={size} key={index} wrap={wrap}>{vc[index]}</VideoCont>];
      setVideoContChildren(newVidContChildren);
    }
    else {
      setHideMoreCls("more-hide");
    }
    if(vc[index+1] == undefined) {
      setHideMoreCls("more-hide");
    }
  }

  //console.log(vidChunks[(vidContIndex == 0 ? 0 : vidContIndex-1)].length > 8 ? "more-hide" : "");
  return (
    <section className={"videoSection " + (videoContChildren.length == 0 ? "disabled" : "")}>
      <h2 className='h2-header'>
        <div>
          <i className={iconCls}></i> {header}
        </div> 
      </h2>
      {/* {testVidCont} */}
      {videoContChildren}
      <div className={"more " + hideMoreCls}><button onClick={()=>{addVideoCont(vidChunks)}}>+</button></div>
    </section>
  );
};

export default VideoSection;