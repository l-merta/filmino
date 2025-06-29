import Card from "@/components/Card";

interface ListProps {
  header: string;
}

export default function List({ header }: ListProps) {
  return (
    <div>
      <h2 className="font-bold text-2xl mb-4">{header}</h2>
      <div className="grid grid-cols-5 gap-y-10 gap-x-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={"card-" + index} />
        ))}
      </div>
    </div>
  );
}