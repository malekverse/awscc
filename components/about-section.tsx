import { Card, CardContent } from "@/components/ui/card"
import { Users, Target, Award, Calendar, Cloud, Star } from "lucide-react"
import { FadeInSection } from "@/components/ui/fade-in-section"
import React from "react"

export function AboutSection() {
  // Hardcoded translations since language context is having issues
  const t = {
    home: "Home",
    about: "À propos",
    features: "Activities",
    projects: "Projects",
    events: "Events",
    gallery: "Gallery",
    contact: "Contact",
    joinUs: "Join the Club",
    awsCloudClub: "AWS Cloud Club",
    scientificClub: "Scientific Club",
    seeMore: "See more",
    seeDetails: "See details",
    register: "Register",
    details: "Details"
  };
  
  return (
    <section id="about" 
    className="py-20 bg-primary/10 relative overflow-hidden bg-secondary/20 dark:bg-secondary/10">
      {/* Cloud and star decorations */}
      <div className="absolute top-10 left-10 text-primary/20 dark:text-primary/10">
        <Cloud size={80} />
      </div>
      <div className="absolute bottom-20 right-10 text-primary/20 dark:text-primary/10">
        <Cloud size={60} />
      </div>
      <div className="absolute top-40 right-20 text-amber-500/30 dark:text-amber-500/20">
        <Star size={24} />
      </div>
      <div className="absolute bottom-40 left-20 text-amber-500/30 dark:text-amber-500/20">
        <Star size={20} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeInSection className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] text-transparent bg-clip-text">
            {t.about} <span className="text-primary">{t.awsCloudClub}</span>
          </h2>
          <p className="text-xl text-gray-800 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
            AWS Cloud Club ISIMS is a community of students passionate about cloud computing and AWS technologies.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <FadeInSection delay={0.2}>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] text-transparent bg-clip-text mb-6">Our Mission</h3>
              <p className="text-gray-800 dark:text-gray-300 mb-6 leading-relaxed">
                AWS Cloud Club ISIMS is dedicated to helping students learn about cloud computing and AWS services. We provide hands-on experience, workshops, and certification preparation to help members build valuable skills for their future careers.
              </p>
              <p className="text-gray-800 dark:text-gray-300 mb-6 leading-relaxed">
                We organize regular meetups, hackathons, and project collaborations that connect students with industry professionals and AWS experts. Our goal is to create a supportive community where members can grow their technical skills and professional network.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-300">100+ Members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-300">Monthly Workshops</span>
                </div>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.4} className="grid grid-cols-2 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-secondary/60 dark:border-gray-700 border-primary/20">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Vision</h4>
                <p className="text-sm text-gray-800 dark:text-gray-300">
                  Empower students to become cloud technology leaders
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-secondary/60 dark:border-gray-700 border-primary/20">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Excellence</h4>
                <p className="text-sm text-gray-800 dark:text-gray-300">Promote excellence in cloud computing education</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow duration-300 col-span-2 bg-white dark:bg-secondary/60 dark:border-gray-700 border-primary/20">
              <CardContent className="p-0">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community</h4>
                <p className="text-sm text-gray-800 dark:text-gray-300">Build a passionate community of cloud enthusiasts</p>
              </CardContent>
            </Card>
          </FadeInSection>
        </div>

        {/* AWS Cloud Club Benefits */}
        <FadeInSection delay={0.6} className="bg-white dark:bg-secondary/60 rounded-2xl p-8 shadow-lg border border-primary/10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] text-transparent bg-clip-text mb-6 text-center">AWS Cloud Club Benefits</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">AWS</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Credits</h4>
              <p className="text-sm text-gray-800 dark:text-gray-300">Free AWS credits for hands-on learning</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">Mentorship</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Program</h4>
              <p className="text-sm text-gray-800 dark:text-gray-300">Connect with AWS professionals</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">Career</div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Opportunities</h4>
              <p className="text-sm text-gray-800 dark:text-gray-300">Internships and job connections</p>
            </div>
          </div>
        </FadeInSection>
      </div>
    </section>
  )
}
