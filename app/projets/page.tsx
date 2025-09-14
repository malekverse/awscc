import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/link-button"
import { ArrowLeft, Cpu, Telescope, Rocket, Zap, Users, Calendar, Award, Target } from "lucide-react"

export default function ProjetsPage() {
  const allProjects = [
    {
      title: "Robot Autonome de Navigation",
      description:
        "Développement d'un robot capable de naviguer de manière autonome en utilisant des capteurs et l'intelligence artificielle. Ce projet implique la programmation de systèmes embarqués, l'intégration de capteurs multiples et l'implémentation d'algorithmes de machine learning pour la reconnaissance d'obstacles.",
      category: "Robotique",
      status: "En cours",
      icon: <Cpu className="h-6 w-6" />,
      technologies: ["Arduino", "Python", "OpenCV", "Machine Learning", "ROS", "Lidar"],
      duration: "6 mois",
      team: "8 membres",
      achievements: ["Prix Innovation ESPRIT 2024", "Participation au concours national de robotique"],
    },
    {
      title: "Plateforme de Gestion Étudiante",
      description:
        "Application web complète pour la gestion des activités du club et l'inscription aux événements. Interface moderne avec tableau de bord administrateur, système de notifications et gestion des membres.",
      category: "Informatique",
      status: "Terminé",
      icon: <Rocket className="h-6 w-6" />,
      technologies: ["React", "Node.js", "MongoDB", "Express", "JWT", "Socket.io"],
      duration: "4 mois",
      team: "6 membres",
      achievements: ["Déployé en production", "500+ utilisateurs actifs"],
    },
    {
      title: "Observatoire Virtuel",
      description:
        "Système de télescope automatisé avec interface web pour l'observation astronomique à distance. Permet aux étudiants de contrôler le télescope et de capturer des images depuis n'importe où.",
      category: "Astronomie",
      status: "En cours",
      icon: <Telescope className="h-6 w-6" />,
      technologies: ["Python", "Raspberry Pi", "Astronomie", "IoT", "WebRTC", "OpenCV"],
      duration: "8 mois",
      team: "5 membres",
      achievements: ["Partenariat avec l'observatoire de Tunis"],
    },
    {
      title: "Système de Monitoring Énergétique",
      description:
        "Solution IoT pour surveiller et optimiser la consommation énergétique des bâtiments universitaires. Collecte de données en temps réel et analyse prédictive.",
      category: "Écologie",
      status: "Planifié",
      icon: <Zap className="h-6 w-6" />,
      technologies: ["IoT", "Sensors", "Data Analytics", "Sustainability", "InfluxDB", "Grafana"],
      duration: "10 mois",
      team: "7 membres",
      achievements: ["Financement obtenu", "Collaboration avec le département énergie"],
    },
    {
      title: "Assistant IA pour l'Apprentissage",
      description:
        "Chatbot intelligent utilisant le traitement du langage naturel pour aider les étudiants dans leurs études scientifiques.",
      category: "Informatique",
      status: "En cours",
      icon: <Cpu className="h-6 w-6" />,
      technologies: ["Python", "NLP", "TensorFlow", "FastAPI", "React", "PostgreSQL"],
      duration: "5 mois",
      team: "4 membres",
      achievements: ["Prototype fonctionnel", "Tests utilisateurs positifs"],
    },
    {
      title: "Drone de Surveillance Environnementale",
      description:
        "Développement d'un drone équipé de capteurs pour surveiller la qualité de l'air et collecter des données environnementales.",
      category: "Robotique",
      status: "Planifié",
      icon: <Rocket className="h-6 w-6" />,
      technologies: ["Arduino", "Capteurs", "GPS", "Télémétrie", "Python", "Data Analysis"],
      duration: "7 mois",
      team: "6 membres",
      achievements: ["Étude de faisabilité terminée"],
    },
  ]

  const activities = [
    {
      title: "Ateliers Techniques Hebdomadaires",
      description:
        "Sessions pratiques sur les dernières technologies : programmation, robotique, astronomie et écologie.",
      frequency: "Chaque mercredi",
      participants: "25-30 étudiants",
      icon: <Cpu className="h-8 w-8" />,
    },
    {
      title: "Nuit des Étoiles",
      description: "Événement annuel d'observation astronomique ouvert au public avec télescopes et conférences.",
      frequency: "Annuel (Août)",
      participants: "200+ visiteurs",
      icon: <Telescope className="h-8 w-8" />,
    },
    {
      title: "Camps Scientifiques d'Été",
      description: "Séjours intensifs de 10 jours avec projets pratiques et formations spécialisées.",
      frequency: "Été",
      participants: "50 participants",
      icon: <Users className="h-8 w-8" />,
    },
    {
      title: "Concours de Programmation",
      description: "Compétitions mensuelles de résolution de problèmes algorithmiques et de développement.",
      frequency: "Mensuel",
      participants: "40-50 étudiants",
      icon: <Award className="h-8 w-8" />,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-green-100 text-green-800"
      case "En cours":
        return "bg-blue-100 text-blue-800"
      case "Planifié":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Robotique":
        return "bg-purple-100 text-purple-800"
      case "Informatique":
        return "bg-blue-100 text-blue-800"
      case "Astronomie":
        return "bg-indigo-100 text-indigo-800"
      case "Écologie":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Projets & Activités</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez en détail tous nos projets innovants et activités régulières qui font la richesse de notre club
              scientifique.
            </p>
          </div>
        </div>
      </section>

      {/* All Projects */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Tous nos <span className="text-[#1D4E89]">Projets</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {allProjects.map((project, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#1D4E89]/10 rounded-lg flex items-center justify-center text-[#1D4E89] group-hover:bg-[#1D4E89] group-hover:text-white transition-colors duration-300">
                        {project.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 group-hover:text-[#1D4E89] transition-colors duration-300">
                          {project.title}
                        </CardTitle>
                        <div className="flex space-x-2 mt-2">
                          <Badge className={getCategoryColor(project.category)}>{project.category}</Badge>
                          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed">{project.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-[#1D4E89]" />
                      <span className="text-gray-600">Durée: {project.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-[#1D4E89]" />
                      <span className="text-gray-600">Équipe: {project.team}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  {project.achievements.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                        <Award className="h-4 w-4 mr-1 text-[#1D4E89]" />
                        Réalisations
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {project.achievements.map((achievement, achIndex) => (
                          <li key={achIndex} className="flex items-center">
                            <Target className="h-3 w-3 mr-2 text-green-500" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Nos <span className="text-[#1D4E89]">Activités Régulières</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((activity, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-[#1D4E89]/10 rounded-full flex items-center justify-center text-[#1D4E89]">
                      {activity.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl text-gray-900">{activity.title}</CardTitle>
                      <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                        <span>📅 {activity.frequency}</span>
                        <span>👥 {activity.participants}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
