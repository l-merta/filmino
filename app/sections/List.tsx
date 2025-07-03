import Card from "@/components/Card";
import { tmdb } from "@/hooks/useTmdb";

interface ListProps {
  header: string;
}

export default function List({ header }: ListProps) {
  const { data } = tmdb.movie.Popular();

  return (
    <div>
      <h2 className="font-bold text-2xl mb-4 opacity-80">{header}</h2>
      <div className="grid grid-cols-5 gap-y-10 gap-x-5">
        {Array.from({ length: 20 }).map((_, index) => (
          <Card key={"card-" + index} details={data?.results[index]} />
        ))}
      </div>
    </div>
  );
}