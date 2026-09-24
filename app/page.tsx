import dynamic from "next/dynamic";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";

// Dynamically import components below the fold to keep the initial page bundle lightweight
const About = dynamic(() => import("../components/About"));
const IncomeTypes = dynamic(() => import("../components/IncomeTypes"));
const EarningPotential = dynamic(() => import("../components/EarningPotential"));
const Features = dynamic(() => import("../components/Features"));
const Ranks = dynamic(() => import("../components/Ranks"));
const LevelIncomeSection = dynamic(() => import("../components/LevelIncomeSection"));
const Vision = dynamic(() => import("../components/Vision"));
const Mission = dynamic(() => import("../components/Mission"));
const Rewards = dynamic(() => import("../components/Rewards"));
const HowToJoin = dynamic(() => import("../components/HowToJoin"));
const Timeline = dynamic(() => import("../components/Timeline"));
const Footer = dynamic(() => import("../components/Footer"));

export default function Home() {
  return (
    <main className="flex flex-col gap-0 bg-transparent text-[#1a1a2e] font-satoshi">
      <NavBar />
      <Hero />
      <About />
      <IncomeTypes />
      <EarningPotential />
      <Features />
      <Ranks />
      <LevelIncomeSection />
      <Vision />
      <Mission />
      <Rewards />
      <HowToJoin />
      <Timeline />
      <Footer />
    </main>
  );
}

