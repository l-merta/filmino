import { Metadata } from "next";
import HledatFilmy from "@/pages/HledatFilmy";

type Params = { query: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { query } = await params;

  return {
    title: `${query} - Filmino`,
    icons: {
      icon: "/images/Filmino_filmy_logo.png",
    },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { query } = await params;

  return <HledatFilmy query={query} />;
}
