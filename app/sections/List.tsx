import CardRow from "@/components/CardRow";
import { Button } from "@/components/ui/button";

import { Plus } from "lucide-react";

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
      {data && <div className="w-full flex justify-center align-middle">
        <Button variant={"ghost"} className="w-30 rounded-full border-2 !p-0 mt-4"><Plus /></Button>
      </div>}
    </div>
  );
}