import ZanrSerialy from "@/pages/ZanrSerialy";

export default function Page({ params }: { params: { id: string } }) {
  return <ZanrSerialy genreId={parseInt(params.id)} />;
}