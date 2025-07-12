import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface HeaderProps {
  active: 'filmy' | 'serialy';
}

export default function Header({ active }: HeaderProps) {
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
        <Button variant="outline" className="ml-2">Přihlásit se</Button>
      </nav>
    </header>
  );
}