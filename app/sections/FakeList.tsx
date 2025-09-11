import React from "react";

import Card from "@/components/Card";

interface ListProps {
  header: string;
  icon?: React.ReactNode;
  className?: string;
  length?: number;
  card?: React.ReactNode;
}

export default function List({ header, icon, className, length, card }: ListProps) {
  return (
    <div className="z-4">
      <div className="flex items-center gap-3 mb-4 opacity-90">
        {icon}
        <h2 className="font-bold text-2xl">{header}</h2>
      </div>
      <div className={(className || "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 gap-y-8")}>
        {Array.from({ length: length || 10 }).map((_, index) => (
          (!card ? 
            <Card key={'card-' + index} type='movie' />
          :
            React.cloneElement(card as React.ReactElement, { key: 'card-' + index })
          )
        ))}
      </div>
    </div>
  );
}