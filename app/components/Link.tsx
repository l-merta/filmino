import Link from 'next/link';

interface LinkProps {
  domain: string;
  url: string;
}

export default function TvLink({ domain, url }: LinkProps) {
  return (
    <Link href={url} target='_blank' rel='noopener noreferrer' className="text-blue-500 hover:underline">
      {domain}
    </Link>
  );
}