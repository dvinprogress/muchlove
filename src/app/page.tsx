import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { SocialProof } from "@/components/landing/SocialProof";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <HeroSection />
        <HowItWorks />
        <SocialProof />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
