import Serialy from "@/pages/Serialy";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seriály - Filmino",
  description: "Objevte nejlepší seriály",
  icons: {
    icon: "/images/Filmino_serialy_logo.png",
  },
};

export default function Page() {
  return <Serialy />;
}