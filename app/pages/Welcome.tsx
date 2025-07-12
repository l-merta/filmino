import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Welcome() {
  return (
    <>
    <main className="flex min-h-screen flex-col items-start justify-center gap-6 p-24">
      <h1 className="font-bold text-4xl">Filmino</h1>
      <nav className="flex gap-2">
        <Link href='filmy'><Button variant="default">Filmy</Button></Link>
        <Link href='serialy'><Button>Seriály</Button></Link>
      </nav>
    </main>
    </>
  );
}
