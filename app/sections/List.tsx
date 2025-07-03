import CardRow from "@/components/CardRow";

import { MovieList } from "@/types/tmdbApi";

interface ListProps {
  header: string;
  data: MovieList | null;
}

export default function List({ header, data }: ListProps) {
  return (
    <div>
      <h2 className="font-bold text-2xl mb-4 opacity-90">{header}</h2>
      <CardRow data={data} />
    </div>
  );
}