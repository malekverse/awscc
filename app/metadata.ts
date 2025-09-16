import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AWS Cloud Club ISIMS | Cloud Computing Community",
  description: "AWS Cloud Club ISIMS is a student-led community focused on AWS technologies, cloud computing, DevOps, and AI. Join us to learn, build, and grow your cloud skills.",
  keywords: [
    "AWS Cloud Club",
    "AWS Cloud Club ISIMS",
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
    "AWSCC",
    "AWSCC ISIMS"
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "fr_FR",
    title: "AWS Cloud Club ISIMS | Cloud Computing Community",
    description: "AWS Cloud Club ISIMS is a student-led community focused on AWS technologies, cloud computing, DevOps, and AI. Join us to learn, build, and grow your cloud skills.",
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
    title: "AWS Cloud Club ISIMS | Cloud Computing Community",
    description: "AWS Cloud Club ISIMS is a student-led community focused on AWS technologies, cloud computing, DevOps, and AI. Join us to learn, build, and grow your cloud skills.",
    images: ["/src/assets/awscc-banner.png"],
    creator: "@awscc_isims"
  }
};