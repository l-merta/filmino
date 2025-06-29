import Card from "@/components/Card";

interface ListProps {
  header: string;
}

export default function List({ header }: ListProps) {
  return (
    <div>
      <h2 className="font-bold text-2xl mb-4 opacity-80">{header}</h2>
      <div className="grid grid-cols-5 gap-y-10 gap-x-5">
        {Array.from({ length: 20 }).map((_, index) => (
          <Card key={"card-" + index} />
        ))}
      </div>
    </div>
  );
}