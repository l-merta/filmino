import ZanrFilmy from "@/pages/ZanrFilmy";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ZanrFilmy genreId={parseInt(id)} />;
}