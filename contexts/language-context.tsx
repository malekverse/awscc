"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

type Language = "fr" | "en" | "ar"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: Record<string, string>
}

const translations = {
  fr: {
    home: "Accueil",
    about: "À propos",
    features: "Activités",
    projects: "Projets",
    events: "Événements",
    gallery: "Galerie",
    contact: "Contact",
    joinUs: "Rejoindre le Club",
    awsCloudClub: "AWS Cloud Club",
    scientificClub: "Club Scientifique",
    seeMore: "Voir plus",
    seeDetails: "Voir les détails",
    register: "S'inscrire",
    details: "Détails",
  },
  en: {
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
    details: "Details",
  },
  ar: {
    home: "الرئيسية",
    about: "حول",
    features: "الأنشطة",
    projects: "المشاريع",
    events: "الأحداث",
    gallery: "المعرض",
    contact: "اتصل بنا",
    joinUs: "انضم للنادي",
    awsCloudClub: "نادي AWS للحوسبة السحابية",
    scientificClub: "النادي العلمي",
    seeMore: "عرض المزيد",
    seeDetails: "عرض التفاصيل",
    register: "تسجيل",
    details: "التفاصيل",
  },
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr")

  // Create t as an object with properties from translations
  const t = translations[language]

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
