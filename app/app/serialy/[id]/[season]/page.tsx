import { tmdb } from "@/lib/serverTmdb";

import Season from "@/pages/Season";

export async function generateMetadata({ params }: { params: Promise<{ id: string, season: string }> }) {
  const { id, season } = await params;
  const { data: tv } = await tmdb.tv.Details(Number(id));
  //const { data: seasonData } = await tmdb.tv.Season(Number(id), Number(season.slice(1)));

  if (tv && season) {
    return {
      title: `${tv.name} - ${season} - Filmino`,
      description: "Detaily sezóny seriálu " + tv.name,
      icons: {
        icon: "/images/Filmino_serialy_logo.png",
      },
    };
  }
}

export default function Page() {
  return <Season />;
}