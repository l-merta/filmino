import ZanrSerialy from "@/pages/ZanrSerialy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Žánr seriálů - Filmino",
  description: "Seriály podle žánru",
  icons: {
    icon: "/images/Filmino_serialy_logo.png",
  },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ZanrSerialy genreId={parseInt(id)} />;
}