import Season from "@/pages/Season";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Série - Filmino",
  description: "Detaily série seriálu",
  icons: {
    icon: "/images/Filmino_serialy_logo.png",
  },
};

export default function Page() {
  return <Season />;
}