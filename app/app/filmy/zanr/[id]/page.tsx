import { tmdb } from "@/lib/serverTmdb";

import ZanrFilmy from "@/pages/ZanrFilmy";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: genre } = await tmdb.genre.Details(Number(id), 'movie');

  if (genre) {
    return {
      title: `${genre.name} - Filmino`,
      description: "Objevte filmy v žánru " + genre.name,
      icons: {
        icon: "/images/Filmino_filmy_logo.png",
      },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ZanrFilmy genreId={parseInt(id)} />;
}