import { tmdb } from "@/lib/serverTmdb";

import Herec from "@/pages/Herec";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: actor } = await tmdb.actor.Details(Number(id));

  if (actor) {
    return {
      title: `${actor.name} - Filmino`,
      description: "Objevte filmy a seriály s hercem " + actor.name,
      icons: {
        icon: "/images/Filmino_filmy_logo.png",
      },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <Herec id={parseInt(id)} />;
}