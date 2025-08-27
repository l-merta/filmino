"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

import Search from "./Search";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { LogOut } from "lucide-react";

interface HeaderProps {
  active?: 'filmy' | 'serialy';
}

export default function Header({ active }: HeaderProps) {
  const { data: session } = useSession();

  //const logoSrc = active === 'filmy' ? "/images/Filmino_filmy_logo.png" : "/images/Filmino_serialy_logo.png";

  return (
    <header className="section-spacing flex items-center justify-between fixed top-0 !mx-auto">
      <div className="flex items-center space-x-5">
        <Link href={"/" + (active || "filmy")} className="flex items-center space-x-3">
          {/* <Image src={logoSrc} alt="Filmino logo" width={34} height={34} /> */}
          <h1 className={"text-[var(--color-main)] text-2xl font-bold"}>Filmino</h1>
        </Link>
        <Search />
      </div>
      <nav className="flex items-center space-x-4">
        <Link href="/filmy" className={(active == "filmy" ? "text-[var(--color-main-1)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
          Filmy
        </Link>
        <Link href="/serialy" className={(active == "serialy" ? "text-[var(--color-main-2)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
          Seriály
        </Link>
        {!session ?
          <div className="flex items-center space-x-2">
            <Link href="/prihlaseni">
              <Button variant="outline" className="!bg-[var(--color-main)] !text-[var(--background-2)] border-0 ml-2">Přihlášení</Button>
            </Link>
            <Link href="/registrace">
              <Button variant="outline" className="button-outline">Registrace</Button>
            </Link>
          </div>
        : 
          <div className="flex items-center space-x-3">
            <Link href="/profil" className="text-sm flex items-center space-x-2 ml-2">
              <Avatar>
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback>{session.user.username && session.user.username.substring(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="whitespace-nowrap">{session.user.username}</span>
            </Link>
            <Button
              onClick={() => signOut({ callbackUrl: "/prihlaseni" })}
              className=""
              variant="outline"
            >
              <LogOut />
            </Button>
          </div>
        }
      </nav>
    </header>
  );
}