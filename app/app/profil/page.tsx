import Uzivatel from "@/pages/Uzivatel";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profil - Filmino",
  description: "Vaše kolekce a profil",
  icons: {
    icon: "/images/Filmino_filmy_logo.png",
  },
};

export default function Page() {
  // Without an id the profile page shows the logged in user
  return <Uzivatel />;
}
