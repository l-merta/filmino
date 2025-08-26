import { tmdb } from "@/lib/serverTmdb";

import ZanrSerialy from "@/pages/ZanrSerialy";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: genre } = await tmdb.genre.Details(Number(id), 'tv');

  if (genre) {
    return {
      title: `${genre.name} - Filmino`,
      description: "Objevte seriály v žánru " + genre.name,
      icons: {
        icon: "/images/Filmino_serialy_logo.png",
      },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ZanrSerialy genreId={parseInt(id)} />;
}