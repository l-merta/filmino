import { useParams } from "next/navigation";
import Image from "next/image";

import { tmdb } from "@/hooks/useTmdb";

import Header from "@/components/Header";
import Genre from "@/components/Genre";
import List from "@/sections/List";

import { Timer } from "lucide-react";

export default function Serial() {
  const params = useParams();
  const id = params?.id as string;
  
  if (!id) {
    return (
      <div className="page-serialy">
        <Header active='serialy' />
        <main className="main-container section-spacing">
          <h1>Tv not found</h1>
        </main>
      </div>
    );
  }

  const { data } = tmdb.tv.Details(Number(id));
  const { data: images } = tmdb.tv.Images(Number(id), { 
    include_image_language: data ? `cs,en,${data.original_language},null` : 'cs,en,null' 
  });

  const poster = images && (images.posters[0] || null);
  const logo = images && (images.logos[0] || null);
  const backdrop = images && (images.backdrops[0] || null);

  console.log("data", data);
  console.log("images", images);

  if (!data) return (
    <div className="page-serialy">
      <Header active='filmy' />
      <main className="main-container section-spacing">
        <h1>Loading</h1>
      </main>
    </div>
  )

  return (
    <div className="page-serialy">
      <Header active="serialy" />
      <main className="main-container section-spacing pt-30 relative">
        <div className="w-75/100 h-120 absolute right-0 top-20 flex items-center justify-center overflow-hidden">
          {backdrop && <Image 
            src={tmdb.image(backdrop.file_path)}
            alt={'backdrop image'}
            width={backdrop.width} 
            height={backdrop.height} 
            className="w-full h-full object-cover absolute z-1" 
          />}
        </div>
        <div className="w-fit min-h-120 flex flex-col gap-4 relative z-3">
          <div className="bg-[var(--background-2)] max-w-120 w-full h-140 rounded-t-xl blur-2xl rotate-[345deg] absolute top-0 left-0 z-[-1] scale-150"></div>
          {logo && <Image 
            src={tmdb.image(logo.file_path)}
            alt={'logo image'}
            width={logo.width} 
            height={logo.height} 
            className="max-w-100 w-fit max-h-80 mb-3" 
          />}
          {!logo && poster && 
            <>
            <Image 
              src={tmdb.image(poster.file_path)}
              alt={'poster image'}
              width={poster.width} 
              height={poster.height} 
              className="max-w-100 w-fit max-h-80 rounded-md" 
            />
            <span className="font-semibold text-xl mb-3">{data.name}</span>
            </>
          }
          <div className="w-screen flex flex-wrap gap-2">
            {data.genres.map((genre, index) => (
              <Genre key={'genre-id-' + genre + index} name={genre.name} link={'/serialy/zanr/' + genre.id} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="opacity-85">{data.first_air_date.split('-')[0]}</span>
            {data.status == "Ended" ? 
              <>
              <span className="font-bold">/</span>
              <span className="opacity-85">Ukončeno</span>
              </>
            : ''
            }
            {data.number_of_seasons ?
              <>
              <span className="font-bold">/</span>
              <span className="opacity-85">{data.number_of_seasons} {data.number_of_seasons > 4 ? 'sérií' : 'série'}</span>
              </>
            : ''
            }
            {data.number_of_episodes ? 
              <>
              <span className="font-bold">/</span>
              <span className="opacity-85">{data.number_of_episodes} ep</span>
              </>
            : ''
            }
          </div>
          <p className="opacity-85 max-w-140 w-screen line-clamp-5">{data.overview}</p>
        </div>
        <List header="Podobné seriály" type='tv' fetchFunction={(params) => tmdb.get("/tv/"+data.id+"/similar", params)} />
      </main>
    </div>
  )
}