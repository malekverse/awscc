import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { LinkButton } from "@/components/ui/link-button"
import { ArrowLeft, Calendar, Users, MapPin } from "lucide-react"
import Image from "next/image"

export default function GaleriePage() {
  const galleryItems = [
    {
      title: "Nuit des Étoiles 2024",
      date: "15 Août 2024",
      location: "Campus ESPRIT",
      participants: "200+ visiteurs",
      images: [
        "/telescope-observation-night-stars.jpg",
        "/students-looking-through-telescope.jpg",
        "/astronomy-presentation-night.jpg",
        "/star-observation-setup.jpg",
      ],
    },
    {
      title: "Camp Scientifique d'Été 2024",
      date: "20-30 Juillet 2024",
      location: "Hammamet",
      participants: "50 participants",
      images: [
        "/robotics-project.png",
        "/programming-workshop-summer-camp.jpg",
        "/team-building-scientific-activities.jpg",
        "/outdoor-science-experiments.jpg",
      ],
    },
    {
      title: "Atelier Robotique",
      date: "10 Mai 2024",
      location: "Lab ESPRIT",
      participants: "30 étudiants",
      images: [
        "/students-building-robot-arduino.jpg",
        "/robotics-components-workshop.jpg",
        "/programming-robot-sensors.jpg",
        "/robot-testing-demonstration.jpg",
      ],
    },
    {
      title: "Concours de Programmation",
      date: "25 Mars 2024",
      location: "Amphithéâtre ESPRIT",
      participants: "45 participants",
      images: [
        "/programming-competition-students-coding.jpg",
        "/algorithm-contest-presentation.jpg",
        "/coding-challenge-winners-ceremony.jpg",
        "/students-collaborating-programming.jpg",
      ],
    },
    {
      title: "Conférence IA & Machine Learning",
      date: "18 Février 2024",
      location: "Auditorium ESPRIT",
      participants: "80 participants",
      images: [
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
      ],
    },
    {
      title: "Projet Observatoire Virtuel",
      date: "Décembre 2023",
      location: "Lab Astronomie",
      participants: "Équipe de 5",
      images: [
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
        "/placeholder.svg?height=300&width=400",
      ],
    },
  ]

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-[#1D4E89] to-[#2563eb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <LinkButton href="/" className="mb-6 text-white border-white hover:bg-white hover:text-[#1D4E89]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </LinkButton>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Galerie Photos</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Revivez les moments forts de nos événements, ateliers et projets à travers notre galerie photo.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {galleryItems.map((event, eventIndex) => (
              <div key={eventIndex} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h2>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-[#1D4E89]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-[#1D4E89]" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-[#1D4E89]" />
                      <span>{event.participants}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {event.images.map((image, imageIndex) => (
                    <div
                      key={imageIndex}
                      className="aspect-square rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${event.title} - Photo ${imageIndex + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
