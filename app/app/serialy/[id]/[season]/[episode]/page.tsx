import { tmdb } from "@/lib/serverTmdb";

import Episode from "@/pages/Episode";

export async function generateMetadata({ params }: { params: Promise<{ id: string; season: string; episode: string }> }) {
  const { id, season, episode } = await params;
  const { data: tv } = await tmdb.tv.Details(Number(id));

  if (tv) {
    return {
      title: `${tv.name} - ${season}${episode} - Filmino`,
      description: "Detaily epizody seriálu " + tv.name,
      icons: {
        icon: "/images/Filmino_serialy_logo.png",
      },
    };
  }
}

export default function Page() {
  return <Episode />;
}
