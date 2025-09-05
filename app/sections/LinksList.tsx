import Link from "@/components/Link";

import { tmdb } from "@/lib/useTmdb";

import { MediaDetails } from "@/types/tmdbApi";

interface LinkProps {
  data: MediaDetails;
  type: "movie" | "tv";
  linkType: string;
}

export default async function LinksList({ data, type, linkType }: LinkProps) {
  const links = await tmdb.links(
    type, 
    linkType, 
    { 
      title: data.original_title || data.original_name, 
      title_cz: data.title || data.name, 
      year: Number(data.release_date.split("-")[0]) || Number(data.first_air_date.split("-")[0])
    }
  );

  console.log(links);

  return (
    <>
    {links && links.map(link => (
      <Link key={link.domain} domain={link.domain} url={link.url} />
    ))}
    </>
  );
}