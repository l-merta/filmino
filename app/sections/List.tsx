import React from "react";

interface ListProps {
  children: React.ReactNode;
  header: string;
  icon?: React.ReactNode;
}

export default function List({ children, header, icon }: ListProps) {
  return (
    <div className="z-4">
      <div className="flex items-center gap-3 mb-4 opacity-90">
        {icon}
        <h2 className="font-bold text-2xl">{header}</h2>
      </div>
      <div className="">
        {children}
      </div>
    </div>
  );
}