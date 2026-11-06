import { Metadata } from "next";
import HledatHerce from "@/pages/HledatHerce";

type Params = { query: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { query } = await params;

  return {
    title: `${decodeURIComponent(query)} - herci - Filmino`,
    icons: {
      icon: "/images/Filmino_filmy_logo.png",
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { query } = await params;

  return <HledatHerce query={query} />;
}
