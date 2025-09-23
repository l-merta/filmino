import { tmdb } from "@/lib/serverTmdb";

import Serial from "@/pages/Serial";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: tv } = await tmdb.tv.Details(Number(id));

  if (tv) {
    const title = `${tv.name ?? tv.title} - Filmino`;
    const description = tv.overview ?? "Zjisti více informací o seriálu na Filmino.";
    const image = tmdb.metadataImage(tv.backdrop_path, tv.poster_path, "tv");

    return {
      title,
      description,
      icons: {
        icon: "/images/Filmino_serialy_logo.png",
      },
      openGraph: {
        title,
        description,
        type: "website",
        url: `https://filmino.mertalukas.cz/serialy/${id}`,
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

export default function Page() {
  return <Serial />;
}