import { useEffect } from "react"
import { useLocation } from "react-router"
import { HeroRevamp } from "@/components/landing/HeroRevamp"
import { BentoFeatures } from "@/components/landing/BentoFeatures"
import { ProcessSection } from "@/components/landing/ProcessSection"
import { TrustGrid } from "@/components/landing/TrustGrid"
import { FaqSection } from "@/components/landing/FaqSection"
import { FooterRevamp } from "@/components/landing/FooterRevamp"
import { CTASection } from "@/components/landing/CTASection"
import { AuroraBackground } from "@/components/ui/aurora-background"

export default function Home() {
  const { hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace("#", ""))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }, [hash])

  return (
    <AuroraBackground className="selection:bg-primary/20 selection:text-primary">
      
      {/* Hero Revamp */}
      <HeroRevamp />
      
      {/* Process Steps */}
      <ProcessSection />

      {/* Bento Grid Features */}
      <BentoFeatures />
      
      {/* Testimonials */}
      <TrustGrid />

      {/* FAQ Section */}
      <FaqSection />
      
      {/* CTA Section */}
      <CTASection />

      {/* Footer Revamp */}
      <FooterRevamp />
      
    </AuroraBackground>
  )
}
