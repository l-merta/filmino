import MovieList from "@/components/MovieList";

export default function Welcome() {
  return (
    <>
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Welcome to Filmino!</h1>
      <p className="text-lg text-gray-600">
        Your personal movie and TV show tracker.
      </p>
    </div>
    <div className="container mx-auto p-4">
      <MovieList />
    </div>
    </>
  );
}