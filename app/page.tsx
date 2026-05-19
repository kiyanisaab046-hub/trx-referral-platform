"use client";

import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import About from "../components/About";
import IncomeTypes from "../components/IncomeTypes";
import EarningPotential from "../components/EarningPotential";
import Features from "../components/Features";
import Ranks from "../components/Ranks";
import LevelIncomeTable from "../components/LevelIncomeTable";
import Vision from "../components/Vision";
import Mission from "../components/Mission";
import Rewards from "../components/Rewards";
import HowToJoin from "../components/HowToJoin";
import Timeline from "../components/Timeline";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="flex flex-col gap-24 bg-deep-black text-white font-satoshi">
      <NavBar />
      <Hero />
      <About />
      <IncomeTypes />
      <EarningPotential />
      <Features />
      <Ranks />
      <LevelIncomeTable />
      <Vision />
      <Mission />
      <Rewards />
      <HowToJoin />
      <Timeline />
      <Footer />
    </main>
  );
}

