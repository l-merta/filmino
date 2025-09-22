import { tmdb } from "@/lib/serverTmdb";

import Kolekce from "@/pages/Kolekce";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: collection } = await tmdb.collection.Details(Number(id));

  if (collection) {
    return {
      title: `${collection.name} - Filmino`,
      description: "Objevte filmy v kolekci " + collection.name,
      icons: {
        icon: "/images/Filmino_filmy_logo.png",
      },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <Kolekce collectionId={parseInt(id)} />;
}