import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATNC | AWS Cloud Club ISIMS",
  description: "Learn about the ATNC (AWS Technical Networking Community) at AWS Cloud Club ISIMS. Discover our technical community, events, and resources.",
  keywords: [
    "ATNC",
    "AWS Technical Networking Community",
    "AWS Cloud Club ISIMS",
    "cloud computing community",
    "technical networking",
    "AWS events",
    "cloud resources",
    "AWS learning",
    "ISIMS community"
  ],
  openGraph: {
    title: "ATNC | AWS Cloud Club ISIMS",
    description: "Learn about the ATNC (AWS Technical Networking Community) at AWS Cloud Club ISIMS. Discover our technical community, events, and resources.",
    images: [
      {
        url: "/src/assets/awscc-banner.png",
        width: 1200,
        height: 630,
        alt: "AWS Cloud Club ISIMS ATNC"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ATNC | AWS Cloud Club ISIMS",
    description: "Learn about the ATNC (AWS Technical Networking Community) at AWS Cloud Club ISIMS. Discover our technical community, events, and resources.",
    images: ["/src/assets/awscc-banner.png"]
  }
};