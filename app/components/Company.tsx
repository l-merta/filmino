import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import { CompanyDetails } from "@/types/tmdbApi";

interface CompanyProps {
  data: CompanyDetails;
}

export default function Company({ data }: CompanyProps) {
  if (!data.logo_path) return null;

  return (
    <Link href={`/spolecnosti/${data.id}`} className="">
      <Image
        src={tmdb.image(data.logo_path)}
        alt={data.name + ' logo'}
        className="w-full max-w-55 h-full max-h-18 object-contain dark:brightness-150"
        width={200}
        height={100}
      />
    </Link>
  )
}