"use client";

import { useParams } from "next/navigation";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import MediaHero from "@/sections/MediaHero";
import ActorList from "@/sections/ActorList";
import MediaList from "@/sections/MediaList";
import FakeList from "@/sections/FakeList";

import ErrorPage from "./Error";

export default function Film() {
  const params = useParams();
  const id = params?.id as string;

  const { data, error } = tmdb.movie.Details(Number(id));

  console.log("data", data);

  if (!id || error) {
    return <ErrorPage code={404} title="Film nenalezen" message="Omlouváme se, ale požadovaný film nebyl nalezen." type="movie" />;
  }

  return (
    <div className="page-filmy">
      <Header active="filmy" />
      <main className="main-container section-spacing pt-30 relative">
        <MediaHero data={data} type='movie' />
        {data ? 
          <ActorList header="Herci" type='movie' fetchFunction={(params) => tmdb.get("/movie/"+data.id+"/credits", params)} />
        :
          <FakeList header="Herci" />
        }
        {data ? 
          <MediaList header="Podobné filmy" type='movie' fetchFunction={(params) => tmdb.get("/movie/"+data.id+"/recommendations", params)} />
        :
          <FakeList header="Podobné filmy" />
        }
      </main>
    </ div>
  )
}