'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { FadeInSection } from "@/components/ui/fade-in-section"

export function EventsSection() {
  const upcomingEvents = [
    {
      title: "Atelier Robotique Avancée",
      date: "15 Mars 2025",
      time: "14:00 - 17:00",
      location: "Lab Robotique ESPRIT",
      participants: "25 places",
      description: "Découvrez les techniques avancées de programmation robotique avec Arduino et capteurs.",
      type: "Atelier",
      status: "Ouvert",
    },
    {
      title: "Conférence IA & Machine Learning",
      date: "22 Mars 2025",
      time: "10:00 - 12:00",
      location: "Amphithéâtre A",
      participants: "100 places",
      description: "Conférence sur les dernières avancées en intelligence artificielle par des experts du domaine.",
      type: "Conférence",
      status: "Ouvert",
    },
    {
      title: "Nuit des Étoiles 2025",
      date: "5 Avril 2025",
      time: "20:00 - 02:00",
      location: "Terrasse ESPRIT",
      participants: "Illimité",
      description: "Soirée d'observation astronomique avec télescopes et ateliers découverte.",
      type: "Événement",
      status: "Bientôt",
    },
    {
      title: "Camp Scientifique d'Été",
      date: "15-22 Juillet 2025",
      time: "Séjour complet",
      location: "Hammamet",
      participants: "50 places",
      description: "Une semaine intensive de projets scientifiques, ateliers et activités de loisirs.",
      type: "Camp",
      status: "Inscriptions ouvertes",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Atelier":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Conférence":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Événement":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Camp":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      default:
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Bientôt":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Inscriptions ouvertes":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      default:
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
    }
  }

  return (
    <section id="evenements" className="py-20 bg-white relative overflow-hidden bg-secondary/20 dark:bg-transparent">
      {/* Cloud shape decorations */}
      <div className="absolute top-20 right-10 opacity-10 dark:opacity-5">
        <div className="w-56 h-56 rounded-full bg-[#E9E1FF]"></div>
      </div>
      <div className="absolute bottom-20 left-10 opacity-10 dark:opacity-5">
        <div className="w-40 h-40 rounded-full bg-[#E9E1FF]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">
              Événements à Venir
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
              Participez à nos ateliers, conférences et événements pour enrichir vos connaissances et rencontrer d'autres
              passionnés de science.
            </p>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {upcomingEvents.map((event, index) => (
            <FadeInSection key={index}>
              <Card className="hover:shadow-xl transition-all duration-300 group dark:bg-secondary/90 dark:border-gray-600 rounded-xl border-[#E9E1FF] dark:border-gray-700 overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex space-x-2">
                      <Badge className={`${getTypeColor(event.type)} rounded-lg`}>{event.type}</Badge>
                      <Badge className={`${getStatusColor(event.status)} rounded-lg`}>{event.status}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-[#7C4DFF] dark:group-hover:text-[#9B6DFF] transition-colors duration-300">
                    {event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{event.description}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="h-4 w-4 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="h-4 w-4 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="h-4 w-4 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                      <Users className="h-4 w-4 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                      <span>{event.participants}</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button className="flex-1 bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] hover:opacity-90 text-white rounded-lg shadow-md">
                      S'inscrire
                    </Button>
                    <LinkButton
                      href="/evenements"
                      variant="outline"
                      className="border-[#9B6DFF] text-[#7C4DFF] hover:bg-gradient-to-r hover:from-[#9B6DFF] hover:to-[#7C4DFF] hover:text-white dark:border-[#9B6DFF] dark:text-[#9B6DFF] dark:hover:text-white bg-transparent rounded-lg"
                    >
                      Détails
                    </LinkButton>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>

        {/* Calendar Integration */}
        <FadeInSection>
          <div className="mt-16 text-center">
            <div className="bg-[#E9E1FF]/20 dark:bg-secondary/60 rounded-2xl p-8 border border-[#E9E1FF] dark:border-gray-700 shadow-lg">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">Restez Informé</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Abonnez-vous à notre calendrier pour ne manquer aucun événement
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] hover:opacity-90 text-white rounded-lg shadow-md">
                  <Calendar className="mr-2 h-4 w-4" />
                  Ajouter au Calendrier
                </Button>
                <Button
                  variant="outline"
                  className="border-[#9B6DFF] text-[#7C4DFF] hover:bg-gradient-to-r hover:from-[#9B6DFF] hover:to-[#7C4DFF] hover:text-white dark:border-[#9B6DFF] dark:text-[#9B6DFF] dark:hover:text-white bg-transparent rounded-lg"
                >
                  Newsletter Mensuelle
                </Button>
              </div>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
