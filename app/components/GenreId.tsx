import { tmdb } from "@/lib/useTmdb";
import Link from "next/link";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

interface GenreIdProps {
  id: number;
  type: 'movie' | 'tv';
  special?: 'outline' | 'active';
}

export default function GenreId({ id, type, special }: GenreIdProps) {
  const { data } = tmdb.genre.Details(id, type);

  console.log("GenreId data", data);

  if (!data) return (
    <Skeleton className="w-20 h-8" />
  )
  else return (
    <Link href={'/' + type + '/zanr/' + data.id}>
      <Button 
        variant={'outline'} 
        className={
          'button-genre !border-transparent border-1 ' + 
          (special === 'outline' ? '!border-[var(--color-main)] border-1 ' : ' ') + 
          (special === 'active' ? 'border-0 !bg-[var(--color-main)] !text-[var(--background-2)] hover:!opacity-80 ' : ' ')
        }
      >
        {data.name}
      </Button>
    </Link>
  )
}