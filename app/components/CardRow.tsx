"use client";

import { useState, useRef, useEffect } from "react";
import { MovieList } from "@/types/tmdbApi";

import Card from "@/components/Card";

interface CardRowProps {
  data: MovieList | null;
}

export default function CardRow({ data }: CardRowProps) {
  const [isHovered, setIsHovered] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create duplicated items for infinite loop
  const items = Array.from({ length: 20 }).map((_, index) => ({
    id: index,
    details: data?.results[index % 10]
  }));

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (data) setIsHovered(false);
  }, [data]);

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex animate-slide"
        style={{
          width: 'fit-content',
          animationPlayState: isHovered ? 'paused' : 'running'
        }}
      >
        {items.map((item, index) => (
          <Card key={'card-' + index} details={item.details} />
        ))}
      </div>
    </div>
  );
}