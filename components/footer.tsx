import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#8a55ff] dark:bg-[#8a55ff] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/images/awscc-logo.jpg" alt="AWS Cloud Clubs Logo" width={40} height={40} className="rounded-lg" />
              <div>
                <h3 className="text-xl font-bold text-blue-100">AWS Cloud Club ISIMS</h3>
                <p className="text-blue-200 text-sm">Club Scientifique</p>
              </div>
            </div>
            <p className="text-blue-100 mb-6 leading-relaxed">
              AWS Cloud Club ISIMS – We empower the next generation of innovators and tech enthusiasts through hands-on experience with cloud computing,
               artificial intelligence, and data science, leveraging the full potential of AWS technologies.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/people/AWS-Cloud-Club-ISIMS/61558406757136" target="_blank" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://www.instagram.com/awscc_isims" target="_blank" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.linkedin.com/company/102401226/" target="_blank" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-100">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="/#projets" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                  Projects & Activities
                </Link>
              </li>
              <li>
                <Link href="/#evenements" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-blue-200 hover:text-blue-400 transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-100">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-sm">ISIMS, Al Ons, Sfax</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-sm">hello@awscc.tn</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-sm">(+216) 94 181 481</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-400/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-blue-200 text-sm">© 2025 AWS Cloud Club ISIMS. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/politique-de-confidentialite" className="text-blue-200 hover:text-blue-400 text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/conditions-utilisation" className="text-blue-200 hover:text-blue-400 text-sm transition-colors duration-200">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
