export default function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">Filmino</h1>
      <nav className="flex space-x-4">
        <a href="/filmy" className="text-[var(--foreground)] hover:underline">
          Filmy
        </a>
        <a href="/serialy" className="text-[var(--foreground)] hover:underline">
          Seriály
        </a>
      </nav>
    </header>
  );
}