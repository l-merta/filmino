import Film from "@/pages/Film";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Film - Filmino",
  description: "Detaily filmu",
  icons: {
    icon: "/images/Filmino_filmy_logo.png",
  },
};

export default function Page() {
  return <Film />;
}