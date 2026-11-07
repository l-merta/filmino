import type { Metadata } from "next";
import Uzivatel from "@/pages/Uzivatel";

export const metadata: Metadata = {
  title: "Profil - Filmino",
  icons: { icon: "/images/Filmino_filmy_logo.png" },
};

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ share?: string }> }) {
  const { id } = await params;
  const { share } = await searchParams;
  return <Uzivatel id={id} share={share ?? null} />;
}
