import type { Metadata } from "next";
import MojeKolekce from "@/pages/MojeKolekce";

export const metadata: Metadata = {
  title: "Moje kolekce - Filmino",
  icons: { icon: "/images/Filmino_filmy_logo.png" },
};

export default function Page() {
  return <MojeKolekce />;
}
