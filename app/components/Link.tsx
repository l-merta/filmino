import Link from 'next/link';

import { Globe } from 'lucide-react';

interface LinkProps {
  domain: string;
  favicon: string;
  url: string;
}

export default function TvLink({ domain, favicon, url }: LinkProps) {
  return (
    <Link href={url} target='_blank' rel='noopener noreferrer' className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
      <div className="w-7 aspect-square bg-foreground/40 rounded-md flex items-center justify-center">
        {favicon !== "" ? 
          <img src={favicon} alt={`${domain} favicon`} className="w-8/10 object-cover rounded-md" />
        :
          <Globe size={20} />
        }
      </div>
      <span className="font-semibold text-lg">{domain}</span>
    </Link>
  );
}