"use client";
import { useState, useMemo, useEffect } from "react";
import { tmdb } from "@/lib/useTmdb";
import throttle from "lodash.throttle";

import { Input } from "./ui/input";
import SearchBlock from "./SearchBlock";

export default function Search() {
  const [search, setSearch] = useState("");
  const [inputValue, setInputValue] = useState("");

  const throttledSetSearch = useMemo(
    () =>
      throttle((value: string) => {
        setSearch(value);
        //console.log("search", value);
      }, 800),
    []
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    throttledSetSearch(value);
  };

  useEffect(() => {
    return () => {
      throttledSetSearch.cancel();
    };
  }, [throttledSetSearch]);

  return (
    <div className="relative">
      <Input
        placeholder="Hledat"
        className="button-outline w-90"
        value={inputValue}
        onChange={handleInput}
      />
      {search.length > 0 && (
        <div className="w-screen flex flex-wrap gap-2 absolute top-13 left-0 pointer-events-none">
          <SearchBlock search={search} link='filmy' typeName='filmy' fetchFunction={(params) => tmdb.get("/search/movie", { ...params })} />
          <SearchBlock search={search} link='serialy' typeName='seriály' fetchFunction={(params) => tmdb.get("/search/tv", { ...params })} />
        </div>
      )}
    </div>
  );
}
