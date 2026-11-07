import type { Metadata } from "next";
import Sdileni from "@/pages/Sdileni";

export const metadata: Metadata = {
  title: "Sdílený odkaz - Filmino",
  icons: { icon: "/images/Filmino_filmy_logo.png" },
  robots: { index: false },
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <Sdileni token={token} />;
}
