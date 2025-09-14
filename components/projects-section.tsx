'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LinkButton } from "@/components/ui/link-button"
import { ExternalLink, Cloud, Database, Server, Shield } from "lucide-react"
import { FadeInSection } from "@/components/ui/fade-in-section"
import { Button } from "./ui/button"
import Link from "next/link"

export function ProjectsSection() {
  const projects = [
    {
      title: "Serverless Student Portal",
      description:
        "Cloud-native student management platform built with AWS Lambda, API Gateway, and DynamoDB for scalable club operations.",
      category: "Cloud Computing",
      status: "In Progress",
      icon: <Server className="h-6 w-6 group-hover:text-white" />,
      technologies: ["AWS Lambda", "DynamoDB", "API Gateway", "React"],
    },
    {
      title: "AWS Cloud Learning Platform",
      description: "Interactive learning platform for AWS certifications with hands-on labs and progress tracking.",
      category: "Education",
      status: "Completed",
      icon: <Cloud className="h-6 w-6 group-hover:text-white" />,
      technologies: ["AWS Amplify", "Cognito", "S3", "CloudFront"],
    },
    {
      title: "Multi-Cloud Cost Optimizer",
      description: "Automated tool to analyze and optimize cloud spending across AWS, Azure, and GCP environments.",
      category: "DevOps",
      status: "In Progress",
      icon: <Database className="h-6 w-6 group-hover:text-white" />,
      technologies: ["AWS Cost Explorer", "Python", "Terraform", "CloudWatch"],
    },
    {
      title: "Smart Campus IoT Network",
      description:
        "IoT infrastructure using AWS IoT Core to monitor campus facilities and optimize resource usage.",
      category: "IoT & Cloud",
      status: "Planned",
      icon: <Shield className="h-6 w-6 group-hover:text-white" />,
      technologies: ["AWS IoT Core", "Lambda", "TimeStream", "QuickSight"],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
      case "In Progress":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
      case "Planned":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
      default:
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#7C4DFF]/20 dark:text-[#9B6DFF]"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Cloud Computing":
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
      case "Education":
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
      case "DevOps":
        return "bg-[#9B6DFF]/10 text-[#7C4DFF] dark:bg-[#9B6DFF]/30 dark:text-[#9B6DFF]"
      case "IoT & Cloud":
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
              Our Projects & Activities
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
              Discover the innovative cloud computing projects developed by our members using AWS services,
              DevOps practices, and modern cloud architectures.
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
                  {/* <LinkButton
                    href="/projets"
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-[#9B6DFF] group-hover:to-[#7C4DFF] group-hover:border-[#9B6DFF] group-hover:text-white hover:text-white transition-colors duration-300 bg-transparent dark:border-gray-600 dark:text-gray-300 rounded-lg"
                  >
                    View Details
                  </LinkButton> */}
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>

        {/* Activities Overview */}
        <FadeInSection>
          <div className="bg-white dark:bg-secondary/60 rounded-2xl p-8 border border-[#E9E1FF] dark:border-gray-700 shadow-lg">
            <h3 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">
              Our Regular Activities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E9E1FF] dark:bg-[#9B6DFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Cloud className="h-8 w-8 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AWS Workshops</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Weekly hands-on sessions on AWS services and cloud architecture
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E9E1FF] dark:bg-[#9B6DFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Shield className="h-8 w-8 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Certification Bootcamps</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Intensive preparation sessions for AWS certification exams
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#E9E1FF] dark:bg-[#9B6DFF]/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Server className="h-8 w-8 text-[#7C4DFF] dark:text-[#9B6DFF]" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cloud Hackathons</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Competitive events building innovative cloud solutions</p>
              </div>
            </div>
            {/* <div className="text-center mt-8">
              <Link href="/projets">
                <Button
                  className="bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] text-white hover:opacity-90 border-[#9B6DFF] rounded-lg shadow-md"
                >
                  View More Projects
                </Button>
              </Link>
            </div> */}
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
