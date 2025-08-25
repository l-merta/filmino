import { tmdb } from "@/lib/serverTmdb";

import Serial from "@/pages/Serial";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: tv } = await tmdb.tv.Details(Number(id));

  if (tv) {
    return {
      title: `${tv.name ?? tv.title} - Filmino`,
      description: tv.overview,
      icons: {
        icon: "/images/Filmino_serialy_logo.png",
      },
    };
  }
}

export default function Page() {
  return <Serial />;
}