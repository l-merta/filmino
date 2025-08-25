import Filmy from "@/pages/Filmy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Filmy - Filmino",
  description: "Objevte nejlepší filmy",
  icons: {
    icon: "/images/Filmino_filmy_logo.png",
  },
};

export default function Page() {
  return <Filmy />;
}