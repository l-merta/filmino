"use client";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import ActorMediaList from "@/sections/ActorMediaList";
import FakeList from "@/sections/FakeList";

import ErrorPage from "./Error";

interface HerecProps {
  id: number;
}

export default function Herec({ id }: HerecProps) {
  const { data: actorData, error: actorError } = tmdb.actor.Details(id);

  if (actorError) return <ErrorPage code={404} title="Herec nenalezen" message="Omlouváme se, ale požadovaný herec nebyl nalezen." type="movie" />;

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        <h1 className="text-2xl font-bold mb-4">{actorData?.name}</h1>
        {actorData ? 
          <ActorMediaList header="Filmy" type='movie' fetchFunction={(params) => tmdb.get("/person/" + actorData.id + "/movie_credits", params)} />
        :
          <FakeList header="Filmy" />
        }
        {actorData ? 
          <ActorMediaList header="Seriály" type='tv' fetchFunction={(params) => tmdb.get("/person/" + actorData.id + "/tv_credits", params)} />
        :
          <FakeList header="Seriály" />
        }
      </main>
    </div>
  );
}