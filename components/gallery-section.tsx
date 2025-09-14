import Image from "next/image"
import { LinkButton } from "@/components/ui/link-button"
import { Camera } from "lucide-react"
import { FadeInSection } from "@/components/ui/fade-in-section"
import { Button } from "./ui/button"
import Link from "next/link"

export function GallerySection() {
  const recentPhotos = [
    {
      src: "/src/photos/a.jpg",
      alt: "Nuit des Étoiles 2024",
      event: "Nuit des Étoiles 2024",
    },
    {
      src: "/src/photos/b.jpg",
      alt: "Camp Scientifique d'Été",
      event: "Camp Scientifique d'Été",
    },
    {
      src: "/src/photos/c.jpg",
      alt: "Atelier Programmation",
      event: "Atelier Programmation",
    },
    {
      src: "/src/photos/d.jpg",
      alt: "Atelier Robotique",
      event: "Atelier Robotique",
    },
    {
      src: "/src/photos/e.jpg",
      alt: "Conférence IA",
      event: "Conférence IA",
    },
    {
      src: "/src/photos/f.jpg",
      alt: "Projet Observatoire",
      event: "Projet Observatoire",
    },
  ]

  return (
    <section id="galerie" 
    className="py-20 bg-white relative overflow-hidden bg-secondary/20 dark:bg-transparent">
      {/* Cloud shape decorations */}
      <div className="absolute top-20 left-10 opacity-10 dark:opacity-5">
        <div className="w-48 h-48 rounded-full bg-[#E9E1FF]"></div>
      </div>
      <div className="absolute bottom-40 right-10 opacity-10 dark:opacity-5">
        <div className="w-64 h-64 rounded-full bg-[#E9E1FF]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">
            Notre Galerie
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
            Découvrez les moments forts de nos événements, ateliers et projets à travers notre galerie photo.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {recentPhotos.map((photo, index) => (
            <FadeInSection key={index} delay={index * 0.1}>
              <div
                className="group relative aspect-square rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#E9E1FF] dark:border-gray-700"
              >
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#7C4DFF]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="font-semibold text-sm">{photo.event}</p>
                </div>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  )
}
