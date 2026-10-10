"use client";
/* The pre-launch landing page. Sections are static markup in sections/; all
   client behaviour lives in useLandingEffects (page-wide effects) and
   waitlistForm (the join form). Copy and data live in content.js. */

import { useLandingEffects } from "./useLandingEffects";
import Overlays from "./sections/Overlays";
import Nav from "./sections/Nav";
import Hero from "./sections/Hero";
import DropCountdown from "./sections/DropCountdown";
import Manifesto from "./sections/Manifesto";
import HowItWorks from "./sections/HowItWorks";
import Formats from "./sections/Formats";
import Editions from "./sections/Editions";
import Departments from "./sections/Departments";
import Pullquote from "./sections/Pullquote";
import Feed from "./sections/Feed";
import Proof from "./sections/Proof";
import Faq from "./sections/Faq";
import JoinWaitlist from "./sections/JoinWaitlist";
import Footer from "./sections/Footer";

export default function LandingPage() {
  useLandingEffects();
  return (
    <>
      <Overlays />
      <Nav />
      <Hero />
      <DropCountdown />
      <Manifesto />
      <HowItWorks />
      <Formats />
      <Editions />
      <Departments />
      <Pullquote />
      <Feed />
      <Proof />
      <Faq />
      <JoinWaitlist />
      <Footer />
    </>
  );
}
