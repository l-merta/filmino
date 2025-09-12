"use client";

import React, { useEffect, useState } from "react";

import List from "@/sections/List";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

import { ReviewList, ReviewDetails, Params } from "@/types/tmdbApi";

interface ListProps {
  header: string;
  icon?: React.ReactNode;
  fetchFunction: (params?: Params) => Promise<ReviewList>;
  cardCount?: number;
}

export default function MediaList({ header, icon, fetchFunction, cardCount }: ListProps) {
  const [reviewItems, setReviewItems] = useState<ReviewDetails[]>([]);
  const [totalCardCount, setTotalCardCount] = useState(cardCount || 5);

  const [error, setError] = useState<Error | boolean>(false);
  
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const fetchData = async (page: number = 1, increaseCardCount: boolean = true) => {
    try {
      const newTotalCardCount = increaseCardCount ? totalCardCount + (cardCount || 5) : totalCardCount;

      setTotalCardCount(newTotalCardCount);

      if (newTotalCardCount > reviewItems.length) {
        const result = await fetchFunction({ page });
        if (result.total_results == 0) {
          setError(true);
        }
        setTotalPages(result.total_pages || 0);
        setTotalResults(result.total_results || 0);
        if (page === 1) {
          setReviewItems(result.results || []);
        } else {
          setReviewItems(prev => [...prev, ...(result.results || [])]);
        }
        console.log("Fetched data:", result);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(1, false);
  }, []);

  if (error) return null;

  return (
    <List header={header} icon={icon}>
      <div className="flex flex-wrap gap-8">
        {Array.from({ length: totalCardCount }).map((_, index) => (
          (reviewItems.length == 0 && <ReviewCard key={'card-' + index} details={reviewItems[index]} />) ||
          (index < reviewItems.length && <ReviewCard key={'card-' + index} details={reviewItems[index]} />)
        ))}
      </div>
      {reviewItems.length > 0 && totalCardCount < totalResults && <div className="w-full flex justify-center align-middle">
        <Button variant={"ghost"} className="button-outline w-30 rounded-full border-2 !p-0 mt-4" onClick={()=>{fetchData(Math.floor(totalCardCount / 20) + 1)}}><Plus /></Button>
      </div>}
    </List>
  );
}