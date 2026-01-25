import { Navbar } from '@/components/Navbar'
import { HeroSection } from '@/components/HeroSection'
import { MetricsSection } from '@/components/MetricsSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { TrustSection } from '@/components/TrustSection'
import { Footer } from '@/components/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <MetricsSection />
        <FeaturesSection />
        <TrustSection />
      </main>
      <Footer />
    </div>
  )
}