import ZanrFilmy from "@/pages/ZanrFilmy";

export default function Page({ params }: { params: { id: string } }) {
  return <ZanrFilmy genreId={parseInt(params.id)} />;
}