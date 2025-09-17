'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/ui/link-button"
import { Calendar, MapPin, Users, Clock, Cloud, Shield, Server, Database } from "lucide-react"
import { FadeInSection } from "@/components/ui/fade-in-section"

export function EventsSection() {
  const upcomingEvents = [
    {
      title: "Fullstack Web Development Workshop",
      date: "TBA",
      time: "TBA",
      location: "ISIMS",
      participants: "45 spots",
      description: "Comprehensive workshop covering modern fullstack development with cloud integration and AWS services.",
      type: "Workshop",
      status: "Soon",
    },
    {
      title: "Cloud & Cyber Security Summit",
      date: "TBA",
      time: "TBA",
      location: "ISIMS",
      participants: "80 spots",
      description: "Learn about cloud security, cyber threats, AWS security services, and best practices for securing digital infrastructure.",
      type: "Conference",
      status: "Soon",
    },
    {
      title: "AWS Community Day 2025",
      date: "TBA",
      time: "TBA",
      location: "ISIMS",
      participants: "200 spots",
      description: "Join fellow cloud enthusiasts for a full day of AWS sessions, networking, and community building.",
      type: "Event",
      status: "Soon",
    },
    {
      title: "Hackathon 2025",
      date: "TBA",
      time: "TBA",
      location: "Surprise Location",
      participants: "100 spots",
      description: "48-hour coding challenge focused on building innovative cloud solutions and AWS-powered applications.",
      type: "Hackathon",
      status: "Soon",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Workshop":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Conference":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Event":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Hackathon":
         return "bg-[#FF6B6B]/10 text-[#FF6B6B] dark:bg-[#FF6B6B]/20 dark:text-[#FF6B6B]"
      default:
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Soon":
        return "bg-[#E9E1FF] text-[#7C4DFF] dark:bg-[#9B6DFF]/20 dark:text-[#9B6DFF]"
      case "Registration Open":
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
              Upcoming Events
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
              Join our AWS workshops, cloud conferences and certification events to advance your cloud skills and connect with fellow cloud enthusiasts.
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
                    <Button className="flex-1 cursor-[not-allowed] bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] hover:opacity-90 text-white rounded-lg shadow-md">
                      Registration will be open soon
                    </Button>
                    <LinkButton
                      href="#"
                      // href="/evenements"
                      variant="outline"
                      className="border-primary cursor-[not-allowed] text-primary hover:bg-gradient-to-r hover:from-[var(--primary-gradient-from)] hover:to-[var(--primary-gradient-to)] hover:text-white bg-transparent rounded-lg"
                    >
                      Details
                    </LinkButton>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>

        {/* Calendar Integration */}
        {/* <FadeInSection>
          <div className="mt-16 text-center">
            <div className="bg-[#E9E1FF]/20 dark:bg-secondary/60 rounded-2xl p-8 border border-[#E9E1FF] dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-center mb-4">
                <Cloud className="h-8 w-8 text-[#7C4DFF] dark:text-[#9B6DFF] mr-3" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">Stay Informed</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Subscribe to our calendar to never miss an AWS Cloud Club event
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] hover:opacity-90 text-white rounded-lg shadow-md">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button
                  variant="outline"
                  className="border-[#9B6DFF] text-[#7C4DFF] hover:bg-gradient-to-r hover:from-[#9B6DFF] hover:to-[#7C4DFF] hover:text-white dark:border-[#9B6DFF] dark:text-[#9B6DFF] dark:hover:text-white bg-transparent rounded-lg"
                >
                  Monthly Newsletter
                </Button>
              </div>
            </div>
          </div>
        </FadeInSection> */}
      </div>
    </section>
  )
}
