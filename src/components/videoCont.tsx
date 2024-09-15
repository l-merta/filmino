import React from 'react';
import { ReactNode, useEffect, useRef, useState } from 'react'

interface VideoContProps {
  children: ReactNode,
  wrap: boolean,
  size?: any;
}

const videoCont = ({ children, wrap, size }: VideoContProps) => {
  const scrollContainerRef: any = useRef(null);
  const scrollContentRef: any = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  let defScrollSpeed = wrap ? 0 : 2.0;
  const [scrollSpeed, setScrollSpeed] = useState(defScrollSpeed); // Start with 0 until data is loaded
  const scrollPosition = useRef(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const autoScroll = () => {
      if (!isHovered) {
        scrollPosition.current -= scrollSpeed; // Use scrollSpeed to adjust movement
        if (scrollPosition.current <= -scrollContentRef.current.scrollWidth / 2) {
          scrollPosition.current = 0; // Reset position for infinite loop
        }
        scrollContentRef.current.style.transform = `translateX(${scrollPosition.current}px)`;
      }
      animationFrameId.current = requestAnimationFrame(autoScroll);
    };

    animationFrameId.current = requestAnimationFrame(autoScroll);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isHovered, scrollSpeed]); // Add scrollSpeed if you change it dynamically

  const handleMouseEnter = () => {
    setIsHovered(true);
    setScrollSpeed(0);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setScrollSpeed(defScrollSpeed);
  };

  return (
    <>
    <div className={'videoCont ' + (size != "" ? "videoCont-"+size : "")} ref={scrollContainerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className={"innerCont " + (wrap ? "innerCont-wrap" : "")} ref={scrollContentRef}>
        {children}
        {!wrap ? children : ""}
      </div>
    </div>
    </>
  )
}

export default videoCont