import Header from "@/components/Header";
import Carousel from "@/components/Carousel";
import List from "@/sections/List";

export default function Filmy() {
  return (
    <>
    <Header />
    <main className="main-container">
      <Carousel />
      <List header="Super filmy" />
    </main>
    </>
  );
}