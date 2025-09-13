"use client";

import { useParams } from "next/navigation";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import MediaHero from "@/sections/MediaHero";
import List from "@/sections/List";
import ActorList from "@/sections/ActorList";
import MediaList from "@/sections/MediaList";
import CompanyList from "@/sections/CompaniesList";
import ReviewList from "@/sections/ReviewList";
import ReviewCard from "@/components/ReviewCard";
import LinksList from "@/sections/LinksList";
import FakeList from "@/sections/FakeList";
import Card from "@/components/Card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <main className="main-container section-spacing pt-25 relative">
        <MediaHero data={data} type='movie' />
        {data ? 
          <div className="flex gap-8 z-5">
            <LinksList data={data} type='movie' linkType='main' />
          </div>
        :
          <div className="flex gap-8 z-5">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={'link-skeleton-' + index} className="w-32 h-6" />
            ))}
          </div>
        }
        {data && data.belongs_to_collection && 
          <List header="Kolekce">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8">
              <Card collectionDetails={data.belongs_to_collection} />
            </div>
          </List>
        }
        <List header="Produkční společnosti">
          <CompanyList companies={data?.production_companies} />
        </List>
        {data ? 
          <ReviewList header="Recenze" cardCount={4} fetchFunction={(params) => tmdb.get("/movie/"+id+"/reviews", { ...params, language: data.original_language })} />
        :
          <FakeList header="Recenze" length={4} className="grid-cols-none flex flex-wrap gap-8" card={<ReviewCard />} />
        }
        <ActorList header="Herci" type='movie' fetchFunction={(params) => tmdb.get("/movie/"+id+"/credits", params)} />
        <MediaList header="Podobné filmy" type='movie' fetchFunction={(params) => tmdb.get("/movie/"+id+"/recommendations", params)} 
          fallback={
            <MediaList header="Podobné filmy" type='movie' fetchFunction={(params) => tmdb.get("/movie/"+id+"/similar", params)} />
          } 
        />
      </main>
    </ div>
  )
}