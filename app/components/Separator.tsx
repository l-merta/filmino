import { Separator } from "@radix-ui/react-separator";

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
}

export default function SeparatorComponent({ orientation = 'vertical' }: SeparatorProps) {
  return (
    <Separator orientation={orientation} className="opacity-30 bg-[var(--foreground)] w-[2px] h-5 rounded-full" />
  );
}