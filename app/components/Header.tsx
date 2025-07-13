import Link from "next/link";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  active?: 'filmy' | 'serialy';
}

export default function Header({ active }: HeaderProps) {
  const session = false; // Placeholder for session management

  return (
    <header className="section-spacing flex items-center justify-between fixed top-0 !mx-auto">
      <div className="flex items-center space-x-5">
        <h1 className={"text-[var(--color-main)] text-2xl font-bold"}>Filmino</h1>
        <Input placeholder="Hledat" className="w-80"></Input>
      </div>
      <nav className="flex items-center space-x-4">
        <a href="/filmy" className={(active == "filmy" ? "text-[var(--color-main-1)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
          Filmy
        </a>
        <a href="/serialy" className={(active == "serialy" ? "text-[var(--color-main-2)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
          Seriály
        </a>
        {!session ?
          <Link href="/prihlaseni">
            <Button variant="outline" className="ml-2">Přihlásit se</Button>
          </Link>
        :
          <Link href="/profil" className="text-sm flex items-center space-x-2 ml-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <span>username</span>
          </Link>
        }
      </nav>
    </header>
  );
}