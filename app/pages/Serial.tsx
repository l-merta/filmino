"use client";

import { useParams } from "next/navigation";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import MediaHero from "@/sections/MediaHero";
import SeriesList from "@/sections/SeriesList";
import ActorList from "@/sections/ActorList";
import MediaList from "@/sections/MediaList";
import FakeList from "@/sections/FakeList";
import List from "@/sections/List";
import { EpisodeCard } from "@/components/EpisodeCard";

export default function Serial() {
  const params = useParams();
  const id = params?.id as string;
  
  const { data, error } = tmdb.tv.Details(Number(id));

  console.log("data", data);

  if (!id || error) {
    return (
      <div className="page-serialy">
        <Header active='serialy' />
        <main className="main-container section-spacing">
          <h1>Tv not found</h1>
        </main>
      </div>
    );
  }
  
  return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing pt-30 relative">
        <MediaHero data={data} type='tv' />
        {data && <SeriesList header="Série" tvId={data.id} />}
        <div className="">
          {data && (
            data.next_episode_to_air ? (
              <List header="Nejnovější epizoda">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8">
                  <EpisodeCard details={data.next_episode_to_air} tvId={data.id} />
                </div>
              </List>
            ) :
            (data.last_episode_to_air && 
              <List header="Poslední epizoda">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 gap-y-8">
                  <EpisodeCard details={data.last_episode_to_air} tvId={data.id} />
                </div>
              </List>
            )
          )}
        </div>
        {data ? 
          <ActorList header="Herci" type='tv' fetchFunction={(params) => tmdb.get("/tv/"+data.id+"/aggregate_credits", params)} />
        :
          <FakeList header="Herci" />
        }
        {data ? 
          <MediaList header="Podobné seriály" type='tv' fetchFunction={(params) => tmdb.get("/tv/"+data.id+"/recommendations", params)} />
        :
          <FakeList header="Podobné seriály" />
        }
      </main>
    </div>
  )
}