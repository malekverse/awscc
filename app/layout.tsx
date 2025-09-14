import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { ThemeProvider } from "@/contexts/theme-context"
import { LanguageProvider } from "@/contexts/language-context"
import JsonLd from "@/components/json-ld"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL('https://awscc-isims.vercel.app'),
  title: {
    default: "AWS Cloud Club ISIMS",
    template: "%s | AWS Cloud Club ISIMS"
  },
  description: "AWS Cloud Club ISIMS – A student-led club focused on cloud computing, artificial intelligence, DevOps, and AWS technologies. Join us to explore cloud innovations and develop your technical skills.",
  keywords: [
    "AWS Cloud Club",
    "ISIMS",
    "AWS",
    "cloud computing",
    "DevOps",
    "AI",
    "artificial intelligence",
    "tech club",
    "Tunisia",
    "students",
    "university",
    "AWS training",
    "AWS certification",
    "developer community",
    "AWSCC"
  ],
  authors: [{ name: "AWS Cloud Club ISIMS" }],
  creator: "AWS Cloud Club ISIMS",
  publisher: "AWS Cloud Club ISIMS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "fr_FR",
    title: "AWS Cloud Club ISIMS",
    description: "AWS Cloud Club ISIMS – Explore our events, workshops, training, and projects related to cloud computing and AWS technologies.",
    siteName: "AWS Cloud Club ISIMS",
    images: [
      {
        url: "/src/assets/awscc-banner.png",
        width: 1200,
        height: 630,
        alt: "AWS Cloud Club ISIMS"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "AWS Cloud Club ISIMS",
    description: "Join the AWS Cloud Club ISIMS to learn, collaborate, and innovate in the world of cloud computing.",
    images: ["/src/assets/awscc-banner.png"],
    creator: "@awscc_isims"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: {
  //   google: "your-google-verification-code",
  // },
  category: "technology"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
            <JsonLd />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
