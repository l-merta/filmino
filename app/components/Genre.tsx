import Link from "next/link";

import { Button } from "./ui/button";

interface GenreProps {
  name: string;
  link: string;
  special?: 'outline' | 'active';
}

export default function Genre({ name, link, special }: GenreProps) {
  return (
    <Link href={link}>
      <Button 
        variant={'outline'} 
        className={
          'button-outline !border-transparent border-1 ' + 
          (special === 'outline' ? '!border-[var(--color-main)] border-1 ' : ' ') + 
          (special === 'active' ? 'border-0 !bg-[var(--color-main)] !text-[var(--background-2)] hover:!opacity-80 ' : ' ')
        }
      >
        {name}
      </Button>
    </Link>
  )
}