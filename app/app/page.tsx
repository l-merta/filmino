"use client";
import { useGetMovieTopRated } from "@/hooks/useGetMovie";

export default function Home() {
  const { data, isLoading, error } = useGetMovieTopRated(5);
  console.log(data, isLoading, error);

  return (
    <h1>Hello</h1>
  );
}
