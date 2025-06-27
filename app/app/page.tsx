"use client";
import { useGetMoviePopular } from "@/hooks/useGetMoviePopular";

export default function Home() {
  const { data, isLoading, error } = useGetMoviePopular();
  console.log(data, isLoading, error);

  return (
    <h1>Hello</h1>
  );
}
