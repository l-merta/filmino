import HledatFilmy from "@/pages/HledatFilmy";

export default function Page({ params }: { params: { query: string } }) {
  return <HledatFilmy query={params.query} />;
}