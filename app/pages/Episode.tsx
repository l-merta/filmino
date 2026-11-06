"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Star, Timer, Tv } from "lucide-react";

import { tmdb, useTmdbQuery } from "@/lib/useTmdb";

import Header from "@/components/Header";
import Separator from "@/components/Separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MediaActions from "@/components/collections/MediaActions";
import LinksList from "@/sections/LinksList";
import ActorList from "@/sections/ActorList";

import { EpisodeDetails } from "@/types/tmdbApi";

import ErrorPage from "./Error";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Episode() {
  const params = useParams();
  const id = Number(params?.id);
  const seasonNumber = Number(String(params?.season ?? "s01").slice(1));
  const episodeNumber = Number(String(params?.episode ?? "e01").slice(1));

  const { data: tvData, error: tvError } = tmdb.tv.Details(id);
  const { data: seasonData } = tmdb.tv.Season(id, seasonNumber);
  const { data, error } = useTmdbQuery<EpisodeDetails>(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}`);

  if (!id || tvError || error) {
    return <ErrorPage code={404} title="Epizoda nenalezena" message="Omlouváme se, ale požadovaná epizoda nebyla nalezena." type="tv" />;
  }

  const code = `S${pad(seasonNumber)}E${pad(episodeNumber)}`;
  const episodes = seasonData?.episodes ?? [];
  const hasPrev = episodes.some((e) => e.episode_number === episodeNumber - 1);
  const hasNext = episodes.some((e) => e.episode_number === episodeNumber + 1);

  return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing pt-25 relative">
        {!data || !tvData ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="w-full max-w-200 aspect-video" />
            <Skeleton className="w-80 h-8" />
            <Skeleton className="w-140 max-w-full h-4" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href="/serialy">Seriály</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={`/serialy/${id}`}>{tvData.name}</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild><Link href={`/serialy/${id}/s${pad(seasonNumber)}`}>{seasonData?.name ?? `Série ${seasonNumber}`}</Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{code}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-full lg:max-w-160 aspect-video relative flex items-center justify-center shrink-0">
                {data.still_path && (
                  <Image
                    src={tmdb.image(data.still_path)}
                    alt={data.name}
                    width={1280}
                    height={720}
                    className="w-full h-full object-cover rounded-md absolute z-2"
                  />
                )}
                <Tv size={40} className="opacity-70 absolute z-1" />
                <Skeleton className="w-full h-full rounded-md absolute" />
              </div>
              <div className="flex flex-col gap-4">
                <span className="opacity-70 font-semibold">{tvData.name} · {code}</span>
                <h1 className="text-3xl font-bold">{data.name}</h1>
                <div className="flex flex-wrap items-center gap-3 opacity-85">
                  {[
                    data.air_date && <span key="date">{new Date(data.air_date).toLocaleDateString("cs-CZ")}</span>,
                    data.vote_count > 0 && <span key="vote" className="flex items-center gap-2"><Star size={16} /> {data.vote_average.toFixed(1)}</span>,
                    data.runtime && <span key="runtime" className="flex items-center gap-2"><Timer size={16} /> {data.runtime} min</span>,
                  ]
                    .filter(Boolean)
                    .flatMap((el, i) => (i === 0 ? [el] : [<Separator key={"sep" + i} />, el]))}
                </div>
                {data.overview && <p className="opacity-85 max-w-160">{data.overview}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" className="button-outline" disabled={!hasPrev} asChild={hasPrev}>
                    {hasPrev ? <Link href={`/serialy/${id}/s${pad(seasonNumber)}/e${pad(episodeNumber - 1)}`}>Předchozí epizoda</Link> : <span>Předchozí epizoda</span>}
                  </Button>
                  <Button variant="outline" className="button-outline" disabled={!hasNext} asChild={hasNext}>
                    {hasNext ? <Link href={`/serialy/${id}/s${pad(seasonNumber)}/e${pad(episodeNumber + 1)}`}>Další epizoda</Link> : <span>Další epizoda</span>}
                  </Button>
                </div>
              </div>
            </div>
            <MediaActions
              item={{
                type: "episode", tmdbId: id, seasonNumber, episodeNumber,
                title: data.name, subtitle: `${tvData.name} · ${code}`,
                posterPath: data.still_path, year: data.air_date?.split("-")[0] || null,
              }}
            />
            <div className="flex flex-wrap gap-8">
              <LinksList data={{ ...tvData, seasonCode: `s${pad(seasonNumber)}`, episodeCode: `e${pad(episodeNumber)}` }} type="tv" linkType="episode" />
            </div>
          </div>
        )}
        {data && (
          <ActorList header="Herci" type="movie" fetchFunction={(p) => tmdb.get(`/tv/${id}/season/${seasonNumber}/episode/${episodeNumber}/credits`, p)} />
        )}
      </main>
    </div>
  );
}
