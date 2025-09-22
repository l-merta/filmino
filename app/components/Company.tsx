import Link from "next/link";
import Image from "next/image";
import { tmdb } from "@/lib/useTmdb";

import { CompanyDetails } from "@/types/tmdbApi";

interface CompanyProps {
  data: CompanyDetails;
  className?: string;
  isLink?: boolean;
}

export default function Company({ data, isLink = true, className }: CompanyProps) {
  if (!data.logo_path) return null;

  return (
    <Link href={`/spolecnosti/${data.id}`} className={!isLink ? "pointer-events-none" : ""}>
      <Image
        src={tmdb.image(data.logo_path)}
        alt={data.name + ' logo'}
        className={`sticker w-full max-w-55 h-full max-h-18 object-contain ${className}`}
        width={200}
        height={100}
      />
    </Link>
  )
}