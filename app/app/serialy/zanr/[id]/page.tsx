import ZanrSerialy from "@/pages/ZanrSerialy";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ZanrSerialy genreId={parseInt(id)} />;
}