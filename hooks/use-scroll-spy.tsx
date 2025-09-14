"use client"

import { useEffect, useState } from "react"

export function useScrollSpy(sectionIds: string[], offset = 100) {
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset

      // Check if we're at the top of the page
      if (scrollPosition < offset + 100) {
        setActiveSection("home")
        return
      }

      let currentSection = ""
      for (let i = 0; i < sectionIds.length; i++) {
        const section = document.getElementById(sectionIds[i])
        if (section && section.offsetTop <= scrollPosition) {
          currentSection = sectionIds[i]
        }
      }

      setActiveSection(currentSection || "home")
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Call once to set initial state

    return () => window.removeEventListener("scroll", handleScroll)
  }, [sectionIds, offset])

  return activeSection
}
