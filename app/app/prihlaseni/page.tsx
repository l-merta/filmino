import Prihlaseni from "@/pages/Prihlaseni";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Přihlášení - Filmino",
  description: "Přihlaste se a začněte objevovat filmy a seriály",
  icons: {
    icon: "/images/Filmino_filmy_logo.png",
  },
};

export default function Page() {
  return <Prihlaseni />;
}