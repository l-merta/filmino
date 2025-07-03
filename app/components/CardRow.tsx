"use client";

import Card from "@/components/Card";
import { useState, useRef } from "react";

import { MovieList } from "@/types/tmdbApi";

interface CardRowProps {
  data: MovieList | null;
}

export default function CardRow({ data }: CardRowProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create duplicated items for infinite loop
  const items = Array.from({ length: 20 }).map((_, index) => ({
    id: index,
    details: data?.results[index % 10]
  }));

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        className="flex gap-4 animate-slide"
        style={{
          width: 'fit-content',
          animationPlayState: isHovered ? 'paused' : 'running'
        }}
      >
        {items.map((item) => (
          <div key={`card-${item.id}`} className="flex-shrink-0">
            <Card details={item.details} />
          </div>
        ))}
      </div>
    </div>
  );
}