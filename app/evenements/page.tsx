import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EvenementsPage() {
  const allEvents = [
    {
      title: "Atelier Robotique Avancée",
      date: "15 Mars 2025",
      time: "14:00 - 17:00",
      location: "Lab Robotique ESPRIT",
      participants: "25 places",
      description:
        "Découvrez les techniques avancées de programmation robotique avec Arduino et capteurs. Cet atelier pratique vous permettra de maîtriser les concepts fondamentaux de la robotique moderne.",
      type: "Atelier",
      status: "Ouvert",
      longDescription:
        "Un atelier intensif de 3 heures pour apprendre les bases de la robotique avancée. Vous travaillerez avec des kits Arduino, des capteurs ultrasoniques, et des moteurs servo pour créer votre propre robot autonome.",
      prerequisites: "Connaissances de base en programmation",
      materials: "Fournis par le club",
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
      longDescription:
        "Une conférence passionnante animée par des professionnels de l'IA qui partageront leurs expériences et les dernières innovations dans le domaine du machine learning.",
      prerequisites: "Aucun prérequis",
      materials: "Support de présentation fourni",
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
      longDescription:
        "Une nuit magique d'observation des étoiles avec des télescopes professionnels. Découvrez les constellations, les planètes et les nébuleuses avec nos experts en astronomie.",
      prerequisites: "Aucun prérequis",
      materials: "Télescopes fournis",
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
      longDescription:
        "Un camp d'une semaine combinant apprentissage scientifique et détente. Au programme : projets en équipe, conférences, ateliers pratiques et activités de loisirs en bord de mer.",
      prerequisites: "Être membre du club",
      materials: "Liste fournie après inscription",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Atelier":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "Conférence":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "Événement":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Camp":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ouvert":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Bientôt":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Inscriptions ouvertes":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-[#1D4E89] to-blue-700 dark:from-blue-800 dark:to-blue-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/#evenements"
              className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Link>

            <div className="text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Tous nos <span className="text-blue-200">Événements</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Découvrez tous les événements organisés par AWS Cloud Club ISIMS et rejoignez notre communauté scientifique
              </p>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {allEvents.map((event, index) => (
                <Card
                  key={index}
                  className="hover:shadow-xl transition-all duration-300 dark:bg-secondary/60 dark:border-gray-700"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex space-x-2">
                        <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                        <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{event.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{event.longDescription}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                        <Calendar className="h-4 w-4 text-[#1D4E89] dark:text-blue-400" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-[#1D4E89] dark:text-blue-400" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-[#1D4E89] dark:text-blue-400" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                        <Users className="h-4 w-4 text-[#1D4E89] dark:text-blue-400" />
                        <span>{event.participants}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Informations pratiques</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <strong>Prérequis:</strong> {event.prerequisites}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <strong>Matériel:</strong> {event.materials}
                      </p>
                    </div>

                    <Button className="w-full bg-[#1D4E89] hover:bg-[#1D4E89]/90 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                      S'inscrire à cet événement
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
