import { useParams } from "next/navigation";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import MediaHero from "@/sections/MediaHero";
import List from "@/sections/List";

export default function Serial() {
  const params = useParams();
  const id = params?.id as string;
  
  const { data, error } = tmdb.tv.Details(Number(id));

  console.log("data", data);

  if (!id || error) {
    return (
      <div className="page-serialy">
        <Header active='serialy' />
        <main className="main-container section-spacing">
          <h1>Tv not found</h1>
        </main>
      </div>
    );
  }
  
  return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing pt-30 relative">
        <MediaHero data={data} type='tv' />
        {data && <List header="Podobné seriály" type='tv' fetchFunction={(params) => tmdb.get("/tv/"+data.id+"/similar", params)} />}
      </main>
    </div>
  )
}