import { tmdb } from "@/lib/serverTmdb";

export default async function Test() {
  const { data, error } = await tmdb.movie.Details(911430);

  console.log("Test data:", data, "Error:", error);

  return (
    <h1>Test page</h1>
  );
}