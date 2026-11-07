"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

import Search from "./Search";
import { Button } from "./ui/button";
import UserAvatar from "./UserAvatar";

import { FolderHeart, LogOut, Menu, Search as SearchIcon, Settings, User, X } from "lucide-react";

interface HeaderProps {
  active?: 'filmy' | 'serialy';
}

export default function Header({ active }: HeaderProps) {
  const { data: session } = useSession() ?? {};
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile menu / search when the page changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const navLinks = (
    <>
      <Link href="/filmy" className={(active == "filmy" ? "text-[var(--color-main-1)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
        Filmy
      </Link>
      <Link href="/serialy" className={(active == "serialy" ? "text-[var(--color-main-2)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
        Seriály
      </Link>
      {/* {session && (
        <Link href="/profil" className={(pathname === "/profil" || pathname?.startsWith("/kolekce") ? "text-[var(--color-main)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
          Kolekce
        </Link>
      )} */}
    </>
  );

  return (
    <header className="section-spacing fixed top-0 !mx-auto !px-3 sm:!px-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-5 min-w-0">
          <Link href={"/" + (active || "filmy")} className="flex items-center space-x-3 shrink-0">
            <h1 className={"text-[var(--color-main)] text-2xl font-bold"}>Filmino</h1>
          </Link>
          {/* Desktop search */}
          <Search className="hidden lg:block" />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          {navLinks}
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
                <UserAvatar user={session.user} />
                <span className="whitespace-nowrap max-w-40 truncate">{session.user.username}</span>
              </Link>
              {/* <Link href="/nastaveni" aria-label="Nastavení účtu">
                <Button className="button-outline" variant="outline"><Settings /></Button>
              </Link> */}
              <Button
                onClick={() => signOut({ callbackUrl: "/prihlaseni" })}
                className="button-outline"
                variant="outline"
                aria-label="Odhlásit se"
              >
                <LogOut />
              </Button>
            </div>
          }
        </nav>

        {/* Mobile buttons */}
        <div className="flex lg:hidden items-center gap-2">
          <Button variant="outline" size="icon" className="button-outline" aria-label="Hledat" onClick={() => { setSearchOpen((o) => !o); setMenuOpen(false); }}>
            {searchOpen ? <X /> : <SearchIcon />}
          </Button>
          <Button variant="outline" size="icon" className="button-outline" aria-label="Menu" aria-expanded={menuOpen} onClick={() => { setMenuOpen((o) => !o); setSearchOpen(false); }}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile search row */}
      {searchOpen && <Search className="md:hidden mt-3" autoFocus />}

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden mt-4 pb-2 flex flex-col gap-4 text-lg">
          {navLinks}
          <div className="border-t" />
          {!session ? (
            <div className="flex gap-2">
              <Link href="/prihlaseni" className="flex-1">
                <Button className="w-full !bg-[var(--color-main)] !text-[var(--background-2)]">Přihlášení</Button>
              </Link>
              <Link href="/registrace" className="flex-1">
                <Button variant="outline" className="w-full button-outline">Registrace</Button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/profil" className="flex items-center gap-3">
                <UserAvatar user={session.user} />
                <span className="truncate">{session.user.username}</span>
              </Link>
              <Link href="/profil" className="flex items-center gap-3 opacity-80"><User size={18} /> Profil</Link>
              {/* <Link href="/profil" className="flex items-center gap-3 opacity-80"><FolderHeart size={18} /> Moje kolekce</Link> */}
              <Link href="/nastaveni" className="flex items-center gap-3 opacity-80"><Settings size={18} /> Nastavení účtu</Link>
              <button onClick={() => signOut({ callbackUrl: "/prihlaseni" })} className="flex items-center gap-3 opacity-80 text-left cursor-pointer">
                <LogOut size={18} /> Odhlásit se
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
