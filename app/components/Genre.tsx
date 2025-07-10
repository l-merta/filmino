import Link from "next/link";

import { Button } from "./ui/button";

interface GenreProps {
  name: string;
  link: string;
}

export default function Genre({ name, link }: GenreProps) {
  return (
    <Link href={link}>
      <Button variant={'outline'}>
        {name}
      </Button>
    </Link>
  )
}