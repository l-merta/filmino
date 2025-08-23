import { useState } from "react";
import { useTmdbQuery } from "@/hooks/useTmdb";
import { MediaVideos } from "@/types/tmdbApi";
//import { Skeleton } from "./ui/skeleton";

import { Play } from "lucide-react";

interface VideoProps {
  id: number;
  type: 'movie' | 'tv';
}

export default function Video({ id, type }: VideoProps) {
  const [playing, setPlaying] = useState(false);
  
  const { data: videos, isLoading, error } = useTmdbQuery<MediaVideos>(`/${type}/${id}/videos`);

  const video = videos?.results[0];

  /*
  if (isLoading) {
    return (
      <div className="w-full aspect-video">
        <Skeleton className="w-full h-full rounded-md" />
      </div>
    );
  }
  */

  const videoOnClick = () => {
    setPlaying(prev => {
      console.log('Video playing:', !prev);
      return !prev
    });
  }

  if (videos?.results && videos.results.length > 0 && video) {
    return (
      <div className="w-full h-full flex items-center justify-center hover:cursor-pointer group" onClick={videoOnClick}>
        {!playing && <Play size={60} className="opacity-0 group-hover:opacity-80 transition-opacity duration-200" />}
        {playing && (
          <iframe
            src={`https://www.youtube.com/embed/${video.key}?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3`}
            title={video.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full rounded-md"
          />
        )}
      </div>
    );
  }
}