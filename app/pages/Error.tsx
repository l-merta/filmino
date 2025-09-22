import Header from "@/components/Header";

interface ErrorPageProps {
  code: number;
  title: string;
  message: string;
  type: "movie" | "tv";
}

export default function ErrorPage({ code, title, message, type }: ErrorPageProps) {
  return (
    <div className={"page-" + (type == "movie" ? "filmy" : "serialy")}>
      <Header active={type == "movie" ? "filmy" : "serialy"} />
      <main className="main-container section-spacing pt-0 justify-center items-center">
        <div className="flex flex-col items-center justify-center space-y-2 relative pt-20">
          <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center text-9xl font-bold leading-none text-transparent dark:from-white dark:to-slate-900/10 opacity-30 absolute top-0">{code}</span>
          <h1 className="text-5xl font-bold">{title}</h1>
          <p className="text-lg opacity-75">{message}</p>
        </div>
      </main>
    </ div>
  )
}