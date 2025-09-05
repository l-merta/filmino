import { tmdb } from "@/lib/useTmdb";

export default function LinksList() {
  const links = tmdb.links("tv", "main", { title: "dexter: resurrection", title_cz: "dexter: vzkříšení", year: 2025 });

  console.log(links);

  return (
    <div>LinksList</div>
  );
}