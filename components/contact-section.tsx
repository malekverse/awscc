'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Youtube } from "lucide-react"
import { FadeInSection } from "@/components/ui/fade-in-section"

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-gray-50 bg-secondary/20 dark:bg-transparent relative overflow-hidden">
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
              Contact Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-pretty">
              Do you have questions or want to join our community? Don't hesitate to contact us!
            </p>
          </div>
        </FadeInSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          

                    {/* Contact Form + Social Media below it */}
          <div className="space-y-8">
            {/* Contact Form */}
            <FadeInSection>
              <Card className="dark:bg-secondary/60 dark:border-gray-700 rounded-xl border-[#E9E1FF] dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-2xl bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    {/* Form fields remain unchanged */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          First Name
                        </label>
                        <Input id="firstName" placeholder="Your first name" className="dark:bg-secondary/70 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:border-[#9B6DFF] focus:ring-[#9B6DFF] rounded-lg" />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Last Name
                        </label>
                        <Input id="lastName" placeholder="Your last name" className="dark:bg-secondary/70 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:border-[#9B6DFF] focus:ring-[#9B6DFF] rounded-lg" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email
                      </label>
                      <Input id="email" type="email" placeholder="your.email@example.com" className="dark:bg-secondary/70 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:border-[#9B6DFF] focus:ring-[#9B6DFF] rounded-lg" />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                      </label>
                      <Input id="subject" placeholder="Subject of your message" className="dark:bg-secondary/70 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:border-[#9B6DFF] focus:ring-[#9B6DFF] rounded-lg" />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message
                      </label>
                      <Textarea id="message" placeholder="Describe your request or project..." rows={5} className="dark:bg-secondary/70 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:border-[#9B6DFF] focus:ring-[#9B6DFF] rounded-lg" />
                    </div>

                    <Button className="w-full bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] hover:opacity-90 text-white rounded-lg shadow-md">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </FadeInSection>

            {/* Moved: Suivez-nous Section under the form */}
            <FadeInSection>
              <Card className="dark:bg-secondary/60 dark:border-gray-700 rounded-xl border-[#E9E1FF] dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">Follow Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-3 hover:bg-gradient-to-r hover:from-[#9B6DFF] hover:to-[#7C4DFF] hover:text-white hover:border-[#9B6DFF] bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:text-white dark:hover:border-[#9B6DFF] rounded-lg"
                    >
                      <Facebook className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-3 hover:bg-gradient-to-r hover:from-[#9B6DFF] hover:to-[#7C4DFF] hover:text-white hover:border-[#9B6DFF] bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:text-white dark:hover:border-[#9B6DFF] rounded-lg"
                    >
                      <Instagram className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-3 hover:bg-gradient-to-r hover:from-[#9B6DFF] hover:to-[#7C4DFF] hover:text-white hover:border-[#9B6DFF] bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:text-white dark:hover:border-[#9B6DFF] rounded-lg"
                    >
                      <Linkedin className="h-5 w-5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="p-3 hover:bg-gradient-to-r hover:from-[#9B6DFF] hover:to-[#7C4DFF] hover:text-white hover:border-[#9B6DFF] bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:text-white dark:hover:border-[#9B6DFF] rounded-lg"
                    >
                      <Youtube className="h-5 w-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-4">
                    Stay connected for the latest news and club events.
                  </p>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>

          {/* Contact Information & Map stay on the right */}
          <div className="space-y-8">
            <FadeInSection>
              <Card className="dark:bg-secondary/60 dark:border-gray-700 rounded-xl border-[#E9E1FF] dark:border-gray-700 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] bg-clip-text text-transparent">Contact Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-[#9B6DFF] dark:text-[#9B6DFF] mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Institut Supérieur d&apos;Informatique et de Mathématiques de Monastir
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-[#9B6DFF] dark:text-[#9B6DFF] mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">contact@awsclubisims.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-[#9B6DFF] dark:text-[#9B6DFF] mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">+216 73 500 280</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </FadeInSection>

            {/* Map */}
            <FadeInSection>
              <Card className="dark:bg-secondary/60 dark:border-gray-700 rounded-xl border-[#E9E1FF] dark:border-gray-700 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <iframe
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    loading="lazy"
                    className="dark:invert-[92%] contrast-100"
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3235.5613034246097!2d10.58562687654088!3d35.77731767259043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130212a8a39c26c9%3A0x652d9f2a609d2770!2sInstitut%20Sup%C3%A9rieur%20d&#39;Informatique%20et%20de%20Math%C3%A9matiques%20de%20Monastir!5e0!3m2!1sen!2stn!4v1707008804326!5m2!1sen!2stn"
                    allowFullScreen={false}
                    aria-hidden="false"
                    tabIndex={0}
                  ></iframe>
                </CardContent>
              </Card>
            </FadeInSection>
          </div>
        </div>
      </div>
    </section>
  )
}
