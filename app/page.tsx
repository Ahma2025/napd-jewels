import Hero from "./components/Hero";
import MoissaniteEdit from "./components/MoissaniteEdit";
import HomeBanners from "./components/HomeBanners";
import HomeSections from "./components/HomeSections";
import PromiseBand from "./components/PromiseBand";
import OccasionBand from "./components/OccasionBand";

export default function Home() {
  return (
    <>
      <Hero />
      <OccasionBand />
      <MoissaniteEdit />
      <HomeBanners />
      <HomeSections />
      <PromiseBand />
    </>
  );
}
