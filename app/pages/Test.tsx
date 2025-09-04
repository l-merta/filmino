import { tmdb } from "@/lib/serverTmdb";

export default async function Test() {
  const links = await tmdb.links("tv", "main", { title: "dexter: resurrection", title_cz: "dexter: vzkříšení", year: 2025 });

  console.log("Test links:", links);

  return (
    <h1>Test page</h1>
  );
}