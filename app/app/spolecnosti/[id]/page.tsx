import { tmdb } from "@/lib/serverTmdb";

import Spolecnost from "@/pages/Spolecnost";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: company } = await tmdb.company.Details(Number(id));

  if (company) {
    return {
      title: `${company.name} - Filmino`,
      description: "Objevte filmy a seriály společnosti " + company.name,
      icons: {
        icon: "/images/Filmino_filmy_logo.png",
      },
    };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <Spolecnost id={parseInt(id)} />;
}