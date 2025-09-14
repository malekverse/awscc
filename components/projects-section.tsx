'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/link-button"
import { ExternalLink, Cpu, Telescope, Rocket, Zap } from "lucide-react"
import { FadeInSection } from "@/components/ui/fade-in-section"
import { Button } from "./ui/button"
import Link from "next/link"

export function ProjectsSection() {
  const projects = [
    {
      title: "Robot Autonome de Navigation",
      description:
        "Développement d'un robot capable de naviguer de manière autonome en utilisant des capteurs et l'intelligence artificielle.",
      category: "Robotique",
      status: "En cours",
      icon: <Cpu className="h-6 w-6 group-hover:text-white" />,
      technologies: ["Arduino", "Python", "OpenCV", "Machine Learning"],
    },
    {
      title: "Plateforme de Gestion Étudiante",
      description: "Application web complète pour la gestion des activités du club et l'inscription aux événements.",
      category: "Informatique",
      status: "Terminé",
      icon: <Rocket className="h-6 w-6 group-hover:text-white" />,
      technologies: ["React", "Node.js", "MongoDB", "Express"],
    },
    {
      title: "Observatoire Virtuel",
      description: "Système de télescope automatisé avec interface web pour l'observation astronomique à distance.",
      category: "Astronomie",
      status: "En cours",
      icon: <Telescope className="h-6 w-6 group-hover:text-white" />,
      technologies: ["Python", "Raspberry Pi", "Astronomie", "IoT"],
    },
    {
      title: "Système de Monitoring Énergétique",
      description:
        "Solution IoT pour surveiller et optimiser la consommation énergétique des bâtiments universitaires.",
      category: "Écologie",
      status: "Planifié",
      icon: <Zap className="h-6 w-6 group-hover:text-white" />,
      technologies: ["IoT", "Sensors", "Data Analytics", "Sustainability"],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Terminé":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
      case "En cours":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
      case "Planifié":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
      default:
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Robotique":
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
      case "Informatique":
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
      case "Astronomie":
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
      case "Écologie":
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
      default:
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
    }
  }

  return (
    <section id="projets" 
    className="py-20 relative overflow-hidden bg-secondary/20 dark:bg-transparent">
      {/* Cloud shape decorations */}
      <div className="absolute top-10 left-10 opacity-10 dark:opacity-5">
        <div className="w-64 h-64 rounded-full bg-[#E9E1FF]"></div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-10 dark:opacity-5">
        <div className="w-48 h-48 rounded-full bg-[#E9E1FF]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">
              Nos Projets & Activités
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
              Découvrez les projets innovants développés par nos membres dans les domaines de la robotique, de
              l'informatique et de l'astronomie.
            </p>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {projects.map((project, index) => (
            <FadeInSection key={index}>
              <Card className="hover:shadow-xl transition-all duration-300 group dark:bg-secondary/60 dark:border-gray-700 rounded-xl overflow-hidden border-[#E9E1FF] dark:border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#E9E1FF] dark:bg-[#9B6DFF]/20 rounded-xl flex items-center justify-center text-[#7C4DFF] dark:text-[#9B6DFF] group-hover:bg-gradient-to-r group-hover:from-[#9B6DFF] group-hover:to-[#7C4DFF] transition-colors duration-300">
                        {project.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900 dark:text-white group-hover:text-[#9B6DFF] dark:group-hover:text-[#9B6DFF] transition-colors duration-300">
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
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge
                        key={techIndex}
                        variant="outline"
                        className="text-xs border-[#E9E1FF] text-[#7C4DFF] dark:border-[#9B6DFF]/30 dark:text-[#9B6DFF] rounded-lg"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                  <LinkButton
                    href="/projets"
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-[#9B6DFF] group-hover:to-[#7C4DFF] group-hover:border-[#9B6DFF] group-hover:text-white hover:text-white transition-colors duration-300 bg-transparent dark:border-gray-600 dark:text-gray-300 rounded-lg"
                  >
                    Voir les détails
                  </LinkButton>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>

        {/* Activities Overview */}
        <FadeInSection>
          <div className="bg-white dark:bg-secondary/60 rounded-2xl p-8 border border-[#E9E1FF] dark:border-gray-700 shadow-lg">
            <h3 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">
              Nos Activités Régulières
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E9E1FF] dark:bg-[#9B6DFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Cpu className="h-8 w-8 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ateliers Techniques</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Sessions pratiques hebdomadaires sur les dernières technologies
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E9E1FF] dark:bg-[#9B6DFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Telescope className="h-8 w-8 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nuit des Étoiles</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Événement annuel d'observation astronomique ouvert au public
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E9E1FF] dark:bg-[#9B6DFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Rocket className="h-8 w-8 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Camps Scientifiques</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Séjours d'été intensifs avec projets pratiques</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/projets">
                <Button
                  className="bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] text-white hover:opacity-90 border-[#9B6DFF] rounded-lg shadow-md"
                >
                  Voir plus de projets
                </Button>
              </Link>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
