import type { Metadata } from "next";
import UzivatelskaKolekce from "@/pages/UzivatelskaKolekce";

export const metadata: Metadata = {
  title: "Kolekce - Filmino",
  icons: { icon: "/images/Filmino_filmy_logo.png" },
};

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ share?: string }> }) {
  const { id } = await params;
  const { share } = await searchParams;
  return <UzivatelskaKolekce id={id} share={share ?? null} />;
}
