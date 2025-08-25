import React from "react";

import Card from "@/components/Card";

interface ListProps {
  header: string;
  icon?: React.ReactNode;
}

export default function List({ header, icon }: ListProps) {
  return (
    <div className="z-4">
      <div className="flex items-center gap-3 mb-4 opacity-90">
        {icon}
        <h2 className="font-bold text-2xl">{header}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={'card-' + index} type='movie' />
        ))}
      </div>
    </div>
  );
}