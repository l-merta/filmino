import Registrace from "@/pages/Registrace";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registrace - Filmino",
  description: "Zaregistrujte se a začněte objevovat filmy a seriály",
  icons: {
    icon: "/images/Filmino_filmy_logo.png",
  },
};

export default function Page() {
  return <Registrace />;
}