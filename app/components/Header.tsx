interface HeaderProps {
  active: 'filmy' | 'serialy';
}

export default function Header({ active }: HeaderProps) {
  return (
    <header className="flex items-center justify-between fixed top-0 !mx-auto">
      <h1 className={(active == "filmy" ? "text-[var(--color-main)]" : "text-[var(--color-main-2)]") + " text-2xl font-bold"}>Filmino</h1>
      <nav className="flex space-x-4">
        <a href="/filmy" className={(active == "filmy" ? "text-[var(--color-main)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
          Filmy
        </a>
        <a href="/serialy" className={(active == "serialy" ? "text-[var(--color-main-2)]" : "opacity-80") + " font-semibold hover:opacity-70"}>
          Seriály
        </a>
      </nav>
    </header>
  );
}