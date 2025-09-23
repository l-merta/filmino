import { tmdb } from "@/lib/serverTmdb";

import Kolekce from "@/pages/Kolekce";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: collection } = await tmdb.collection.Details(Number(id));

  if (collection) {
    const title = `${collection.name} - Filmino`;
    const description = collection.overview ?? "Zjisti více informací o kolekci na Filmino.";
    const image = tmdb.metadataImage(collection.backdrop_path, collection.poster_path, "movie");

    return {
      title,
      description,
      icons: {
        icon: "/images/Filmino_filmy_logo.png",
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://filmino.mertalukas.cz/filmy/kolekce/${id}`,
        images: [
          {
            url: image.imagePath,
            width: image.dimensions.width,
            height: image.dimensions.height,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [image.imagePath],
      },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <Kolekce collectionId={parseInt(id)} />;
}