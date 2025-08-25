import Profil from "@/pages/Profil";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil - Filmino",
  description: "Spravujte svůj profil a nastavení",
  icons: {
    icon: "/images/Filmino_filmy_logo.png",
  },
};

export default function Page() {
  return <Profil />;
}
