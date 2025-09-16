import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizing Committee | AWS Cloud Club ISIMS",
  description: "Meet the Organizing Committee (OC) of AWS Cloud Club ISIMS. Learn about our team, leadership, and how we're building the cloud computing community.",
  keywords: [
    "Organizing Committee",
    "OC team",
    "AWS Cloud Club leadership",
    "ISIMS student leaders",
    "cloud computing team",
    "AWS student organizers",
    "tech community leaders",
    "AWS Cloud Club ISIMS team",
    "student tech organization"
  ],
  openGraph: {
    title: "Organizing Committee | AWS Cloud Club ISIMS",
    description: "Meet the Organizing Committee (OC) of AWS Cloud Club ISIMS. Learn about our team, leadership, and how we're building the cloud computing community.",
    images: [
      {
        url: "/src/assets/awscc-banner.png",
        width: 1200,
        height: 630,
        alt: "AWS Cloud Club ISIMS Organizing Committee"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Organizing Committee | AWS Cloud Club ISIMS",
    description: "Meet the Organizing Committee (OC) of AWS Cloud Club ISIMS. Learn about our team, leadership, and how we're building the cloud computing community.",
    images: ["/src/assets/awscc-banner.png"]
  }
};