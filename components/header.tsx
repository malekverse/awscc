"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun, Globe, Check } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
// Temporarily hardcoding translations until we fix the context issue
import { useScrollSpy } from "@/hooks/use-scroll-spy"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AnimatedNavLink } from "@/components/ui/animated-nav-link"
import { motion } from "framer-motion"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  // Temporarily hardcoded values
const language = "en";
const setLanguage = (lang: string) => console.log("Language change attempted:", lang);
const t = {
  home: "Home",
  about: "About",
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

  const activeSection = useScrollSpy(["home", "about", "features", "projets", "evenements", "contact"])

  const languageOptions = [
    { code: "fr" as const, name: "Français", flag: "🇫🇷" },
    { code: "en" as const, name: "English", flag: "🇺🇸" },
    // { code: "ar" as const, name: "العربية", flag: "🇹🇳" },
  ]

  const navigation = [
    { name: t.home, href: "/", id: "home" },
    { name: t.about, href: "/#about", id: "about" },
    { name: t.features, href: "/#features", id: "features" },
    { name: t.projects, href: "/#projets", id: "projets" },
    { name: t.events, href: "/#evenements", id: "evenements" },
    { name: t.contact, href: "/#contact", id: "contact" },
  ]

  return (
    <header className="fixed top-0 w-full bg-white/95 dark:bg-background/95 backdrop-blur-sm border-b border-border z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
            <Image src="/images/awscc-logo.jpg" alt="AWS Cloud Clubs Logo" width={40} height={40} className="rounded-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">{t.awsCloudClub}</h1>
              <p className="text-xs text-foreground/70">ISIMS</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex space-x-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {navigation.map((item) => (
              <AnimatedNavLink
                key={item.name}
                href={item.href}
                isActive={activeSection === item.id}
                className="font-medium text-foreground/70 hover:text-primary transition-colors duration-200"
                activeClassName="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)]"
              >
                {item.name}
              </AnimatedNavLink>
            ))}
          </motion.nav>

          {/* Theme and Language Toggles + CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="text-foreground/70 hover:text-primary transition-colors duration-200"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/70 hover:text-primary transition-colors duration-200"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languageOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.code}
                    onClick={() => setLanguage(option.code)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>{option.flag}</span>
                      <span>{option.name}</span>
                    </span>
                    {language === option.code && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> */}

            <Button asChild>
              <a href="/join">{t.joinUs}</a>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  {language.toUpperCase()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languageOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.code}
                    onClick={() => setLanguage(option.code)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>{option.flag}</span>
                      <span>{option.name}</span>
                    </span>
                    {language === option.code && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu> */}
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 pt-4 pb-6 space-y-3 bg-background/98 backdrop-blur-md border-t border-border shadow-lg">
              {navigation.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  className="relative"
                >
                  <AnimatedNavLink
                    href={item.href}
                    isActive={activeSection === item.id}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full px-4 py-3 text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200"
                    activeClassName="text-primary bg-primary/10 font-semibold"
                  >
                    {item.name}
                  </AnimatedNavLink>
                </motion.div>
              ))}
              
              {/* Separator */}
              <motion.div 
                className="border-t border-border my-4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: navigation.length * 0.1, duration: 0.3 }}
              />
              
              {/* CTA Button */}
              <motion.div 
                className="px-2 pt-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (navigation.length + 1) * 0.1, duration: 0.3 }}
              >
                <Button asChild className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] hover:opacity-90 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                  <a href="/join">{t.joinUs}</a>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  )
}
