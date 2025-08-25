import Serial from "@/pages/Serial";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seriál - Filmino",
  description: "Detaily seriálu",
  icons: {
    icon: "/images/Filmino_serialy_logo.png",
  },
};

export default function Page() {
  return <Serial />;
}