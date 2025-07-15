import SearchCard from "./SearchCard";

interface SearchBlockProps {
  search: string;
}

export default function SearchBlock({ search }: SearchBlockProps) {
  return (
    <div className="w-80 bg-[var(--background-2)] flex flex-col gap-1">
      <span>{search}</span>
      <SearchCard />
      <SearchCard />
      <SearchCard />
      <SearchCard />
      <SearchCard />
    </div>
  );
}