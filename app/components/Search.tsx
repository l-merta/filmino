"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { tmdb } from "@/lib/useTmdb";
import throttle from "lodash.throttle";

import { Input } from "./ui/input";
import SearchBlock from "./SearchBlock";
import type { SearchResult } from "./SearchCard";
import { cn } from "@/lib/utils";

import { Params } from "@/types/tmdbApi";

// Stable references, so SearchBlock doesn't refetch on every render
type SearchResponse = { results?: SearchResult[]; total_results?: number };
const searchMovies = (params?: Params) => tmdb.get<SearchResponse>("/search/movie", { ...params });
const searchTv = (params?: Params) => tmdb.get<SearchResponse>("/search/tv", { ...params });
const searchPeople = (params?: Params) => tmdb.get<SearchResponse>("/search/person", { ...params });

interface SearchProps {
  className?: string;
  autoFocus?: boolean;
}

export default function Search({ className, autoFocus }: SearchProps) {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");
  const pathname = usePathname();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const throttledSetSearch = useMemo(
    () =>
      throttle((value: string) => {
        setSearch(value);
      }, 800),
    []
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    throttledSetSearch(value);
  };

  const clear = () => {
    throttledSetSearch.cancel();
    setInputValue("");
    setSearch("");
  };

  useEffect(() => {
    return () => {
      throttledSetSearch.cancel();
    };
  }, [throttledSetSearch]);

  // Close the results after navigating to another page
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <Input
        placeholder="Hledat filmy, seriály, herce"
        className="button-outline w-full md:w-90"
        value={inputValue}
        onChange={handleInput}
        onKeyDown={(e) => e.key === "Escape" && clear()}
        autoFocus={autoFocus}
        type="search"
      />
      {search.length > 0 && (
        <div
          className={cn(
            // Phones: a full-width scrollable column under the header
            "fixed left-0 right-0 top-[7.5rem] bottom-0 overflow-y-auto px-3 pb-6 flex flex-col gap-2 bg-[var(--background-2)]",
            // Desktop: blocks side by side under the input
            "md:absolute md:top-13 md:bottom-auto md:right-auto md:w-screen md:px-0 md:pb-0 md:overflow-visible md:flex-row md:flex-wrap md:bg-transparent md:pointer-events-none"
          )}
        >
          <SearchBlock search={search} link='filmy' typeName='filmy' fetchFunction={searchMovies} />
          <SearchBlock search={search} link='serialy' typeName='seriály' fetchFunction={searchTv} />
          <SearchBlock search={search} link='herci' typeName='herce' label='herci' fetchFunction={searchPeople} />
        </div>
      )}
    </div>
  );
}
