import Error from './../pages/Error';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Chyba - Filmino`,
    description: "Při používání aplikace došlo k chybě",
    icons: {
        icon: "/images/Filmino_filmy_logo.png",
    },
  };
}

export default function Page() {
  return <Error code={404} title="Stránka nenalezena" message="Omlouváme se, ale požadovaná stránka nebyla nalezena." type='movie' />;
}