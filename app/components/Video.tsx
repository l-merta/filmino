import { useState, useEffect } from "react";
import { useTmdbQuery } from "@/hooks/useTmdb";
import { MediaVideos, MediaDetails, MediaVideoDetails } from "@/types/tmdbApi";
//import { Skeleton } from "./ui/skeleton";

import { Play } from "lucide-react";

interface VideoProps {
  id: number;
  type: 'movie' | 'tv';
  typePreference?: string[];
  languagePreference?: string[];
}

export default function Video({ 
  id, 
  type, 
  typePreference = ['Trailer', 'Teaser', 'Clip'],
  languagePreference = ['en', 'cs']
}: VideoProps) {
  const [playing, setPlaying] = useState(false);
  
  const { data: videos, isLoading, error } = useTmdbQuery<MediaVideos>(`/${type}/${id}/videos`, { include_video_language: 'en,null' });
  const { data: mediaDetails } = useTmdbQuery<MediaDetails>(`/${type}/${id}`);

  // Listen for YouTube player messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return;
      
      const data = JSON.parse(event.data);
      if (data.event === 'video-ended' || data.info === 0) {
        setPlaying(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Function to filter and select the best video
  const selectBestVideo = (videoResults: MediaVideoDetails[]): MediaVideoDetails | null => {
    if (!videoResults || videoResults.length === 0) return null;

    const originalLanguage = mediaDetails?.original_language;
    
    // Create scoring function for videos
    const scoreVideo = (video: MediaVideoDetails): number => {
      let score = 0;
      
      // Score based on type preference (higher index = lower preference)
      const typeIndex = typePreference.indexOf(video.type);
      if (typeIndex !== -1) {
        score += (typePreference.length - typeIndex) * 1000;
      }
      
      // Score based on language preference
      const langIndex = languagePreference.indexOf(video.iso_639_1);
      if (langIndex !== -1) {
        score += (languagePreference.length - langIndex) * 100;
      }
      
      // Bonus for original language if not in preference list
      if (originalLanguage && video.iso_639_1 === originalLanguage && langIndex === -1) {
        score += 50;
      }
      
      // Bonus for official videos
      if (video.official) {
        score += 10;
      }
      
      return score;
    };

    // Sort videos by score and return the best one
    const sortedVideos = videoResults.sort((a, b) => scoreVideo(b) - scoreVideo(a));
    return sortedVideos[0];
  };

  const video = selectBestVideo(videos?.results || []);

  const videoOnClick = () => {
    setPlaying(prev => {
      return !prev
    });
  }

  if (video) {
    return (
      <div className="w-full aspect-video flex !items-center justify-center hover:cursor-pointer group" onClick={videoOnClick}>
        {!playing && <Play size={60} className="mb-25 opacity-0 group-hover:opacity-80 transition-opacity duration-200" />}
        {playing && (
          <iframe
            src={`https://www.youtube.com/embed/${video.key}?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
            title={video.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        )}
      </div>
    );
  }

  return null;
}