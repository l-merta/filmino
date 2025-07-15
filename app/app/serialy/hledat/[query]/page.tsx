import HledatSerialy from "@/pages/HledatSerialy";

export default function Page({ params }: { params: { query: string } }) {
  return <HledatSerialy query={params.query} />;
}