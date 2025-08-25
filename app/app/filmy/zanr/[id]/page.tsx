import ZanrFilmy from "@/pages/ZanrFilmy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Žánr filmů - Filmino",
  description: "Filmy podle žánru",
  icons: {
    icon: "/images/Filmino_filmy_logo.png",
  },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ZanrFilmy genreId={parseInt(id)} />;
}