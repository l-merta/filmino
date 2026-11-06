import type { Metadata } from "next";
import NastaveniKolekce from "@/pages/NastaveniKolekce";

export const metadata: Metadata = {
  title: "Nastavení kolekce - Filmino",
  icons: { icon: "/images/Filmino_filmy_logo.png" },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NastaveniKolekce id={id} />;
}
