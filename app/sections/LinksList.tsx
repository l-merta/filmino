"use client";

import Link from "@/components/Link";

import { tmdb } from "@/lib/useTmdb";

import { MediaDetails } from "@/types/tmdbApi";

interface LinkProps {
  data: MediaDetails & { episodeCode?: string; seasonCode?: string };
  type: "movie" | "tv";
  linkType: string;
}

function TitleWithoutWord(title: string, word: string): string {
  const trimmedTitle = title.toLowerCase().replace(new RegExp(`^(${word})\\s+`, 'i'), '').trim();
  return trimmedTitle;
}

export default function LinksList({ data, type, linkType }: LinkProps) {
  const { data: response, isLoading, error } = tmdb.useLinks(
    type, 
    linkType, 
    { 
      title: data.original_title || data.original_name, 
      title_cz: data.title || data.name, 
      title_without_the: TitleWithoutWord(data.original_title || data.original_name, "the"),
      year: Number(data.release_date?.split("-")[0]) || Number(data.first_air_date?.split("-")[0]),
      seasonCode: data.seasonCode,
      episodeCode: data.episodeCode
    }
  );

  const links = response?.results || [];

  console.log(links);

  if (!isLoading && !error && links.length !== 0) return (
    <>
    {links.map(link => (
      <Link key={link.domain} domain={link.domain} url={link.url} favicon={link.favicon} />
    ))}
    </>
  );
}