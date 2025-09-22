import { tmdb } from "@/lib/serverTmdb";

import Film from "@/pages/Film";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: movie } = await tmdb.movie.Details(Number(id));

  if (movie) {
    const title = `${movie.name ?? movie.title} - Filmino`;
    const description = movie.overview ?? "Zjisti více informací o filmu na Filmino.";
    const image = tmdb.metadataImage(movie.backdrop_path, movie.poster_path, "movie");

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
        url: `https://filmino.mertalukas.cz/filmy/${id}`,
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
  return <Film />;
}