"use client";

import { useParams } from "next/navigation";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import SeasonHero from "@/sections/SeasonHero";
import EpisodesList from "@/sections/EpisodesList";

export default function Season() {
  const params = useParams();
  const id = params?.id as string;
  const seasonNumber = Number((params?.season as string).slice(1));
  
  const { data: tvData, error: tvError } = tmdb.tv.Details(Number(id));
  const { data: seasonData, error: seasonError } = tmdb.tv.Season(Number(id), seasonNumber);

  console.log("seasonData", seasonData, "tvData", tvData);

  if (!id || tvError || seasonError) {
    return (
      <div className="page-serialy">
        <Header active='serialy' />
        <main className="main-container section-spacing">
          <h1>Tv not found</h1>
        </main>
      </div>
    );
  }

  if (tvData && seasonData) return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing pt-30 relative">
        <SeasonHero tvData={tvData} seasonData={seasonData} />
        <EpisodesList header="Epizody" tvId={tvData.id} seasonId={seasonData.season_number} />
      </main>
    </div>
  )
}