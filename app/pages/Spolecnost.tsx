"use client";

import { tmdb } from "@/lib/useTmdb";

import Header from "@/components/Header";
import Company from "@/components/Company";
import MediaList from "@/sections/MediaList";
import FakeList from "@/sections/FakeList";

import ErrorPage from "./Error";

interface SpolecnostProps {
  id: number;
}

export default function Spolecnost({ id }: SpolecnostProps) {
  const { data: companyData, error: companyError } = tmdb.company.Details(id);

  if (companyError) return <ErrorPage code={404} title="Společnost nenalezena" message="Omlouváme se, ale požadovaná společnost nebyla nalezena." type="movie" />;

  return (
    <div className="page-filmy">
      <Header />
      <main className="main-container section-spacing">
        {/* <h1 className="text-2xl font-bold mb-4">{companyData?.name}</h1> */}
        {companyData && <Company data={companyData} isLink={false} className="max-w-80 max-h-30" />}
        {companyData ? 
          <MediaList header="Filmy" type='movie' fetchFunction={(params) => tmdb.get("/discover/movie", { ...params, with_companies: companyData.id })} />
        :
          <FakeList header="Filmy" />
        }
        {companyData ? 
          <MediaList header="Seriály" type='tv' fetchFunction={(params) => tmdb.get("/discover/tv", { ...params, with_companies: companyData.id })} />
        :
          <FakeList header="Seriály" />
        }
      </main>
    </div>
  );
}