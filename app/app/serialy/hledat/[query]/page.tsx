import { Metadata } from "next";
import HledatSerialy from "@/pages/HledatSerialy";

type Params = { query: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { query } = await params;

  return {
    title: `Hledání ${query}`,
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { query } = await params;

  return <HledatSerialy query={query} />;
}
