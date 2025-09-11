"use client";

import { useParams } from "next/navigation";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import MediaHero from "@/sections/MediaHero";
import SeriesList from "@/sections/SeriesList";
import ActorList from "@/sections/ActorList";
import MediaList from "@/sections/MediaList";
import LinksList from "@/sections/LinksList";
//import CompanyList from "@/sections/CompaniesList";
import ReviewList from "@/sections/ReviewList";
import { ReviewCard } from "@/components/ReviewCard";
import FakeList from "@/sections/FakeList";
import List from "@/sections/List";
import { EpisodeCard } from "@/components/EpisodeCard";
import { Skeleton } from "@/components/ui/skeleton";

import ErrorPage from "./Error";

export default function Serial() {
  const params = useParams();
  const id = params?.id as string;
  
  const { data, error } = tmdb.tv.Details(Number(id));

  console.log("data", data);

  if (!id || error) {
    return <ErrorPage code={404} title="Seriál nenalezen" message="Omlouváme se, ale požadovaný seriál nebyl nalezen." type="tv" />;
  }
  
  return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing pt-25 relative">
        <MediaHero data={data} type='tv' />
        {data ? 
          <div className="flex gap-8 z-5">
            <LinksList data={{ ...data, seasonCode: "s01", episodeCode: "e01" }} type='tv' linkType='main' />
          </div>
        :
          <div className="flex gap-8 z-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={'link-skeleton-' + index} className="w-32 h-6" />
            ))}
          </div>
        }
        {data ? 
          <SeriesList header="Série" tvId={data.id} />
        :
          <FakeList header="Série" length={4} className="grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" />
        }
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
        {/* <List header="Produkční společnosti">
          <CompanyList companies={data?.production_companies} />
        </List> */}
        {data ? 
          <ReviewList header="Recenze" fetchFunction={(params) => tmdb.get("/tv/"+id+"/reviews", { ...params, language: data.original_language })} />
        :
          <FakeList header="Recenze" length={4} className="no-grid flex flex-wrap gap-8" card={<ReviewCard />} />
        }
        <ActorList header="Herci" type='tv' fetchFunction={(params) => tmdb.get("/tv/"+id+"/aggregate_credits", params)} />
        <MediaList header="Podobné seriály" type='tv' fetchFunction={(params) => tmdb.get("/tv/"+id+"/recommendations", params)} />
      </main>
    </div>
  )
}