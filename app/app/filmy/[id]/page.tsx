import { tmdb } from "@/lib/serverTmdb";

import Film from "@/pages/Film";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: movie } = await tmdb.movie.Details(Number(id));

  if (movie) {
    return {
      title: `${movie.name ?? movie.title} - Filmino`,
      description: movie.overview,
      icons: {
        icon: "/images/Filmino_filmy_logo.png",
      },
    };
  }
}

export default function Page() {
  return <Film />;
}