import type { Metadata } from "next";
import Nastaveni from "@/pages/Nastaveni";

export const metadata: Metadata = {
  title: "Nastavení účtu - Filmino",
  icons: { icon: "/images/Filmino_filmy_logo.png" },
};

export default function Page() {
  return <Nastaveni />;
}
