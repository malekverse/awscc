import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join AWS Cloud Club ISIMS | Membership Application",
  description: "Apply to become a member of AWS Cloud Club ISIMS. Join our community of cloud enthusiasts and participate in our events, workshops, and training sessions.",
  keywords: [
    "AWS Cloud Club membership",
    "join AWS club",
    "ISIMS student club",
    "cloud computing community",
    "AWS training",
    "tech community Tunisia",
    "cloud skills",
    "student organization",
    "application form"
  ],
  openGraph: {
    title: "Join AWS Cloud Club ISIMS | Membership Application",
    description: "Apply to become a member of AWS Cloud Club ISIMS. Join our community of cloud enthusiasts and participate in our events, workshops, and training sessions.",
    images: [
      {
        url: "/src/assets/awscc-banner.png",
        width: 1200,
        height: 630,
        alt: "AWS Cloud Club ISIMS Membership"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Join AWS Cloud Club ISIMS | Membership Application",
    description: "Apply to become a member of AWS Cloud Club ISIMS. Join our community of cloud enthusiasts and participate in our events, workshops, and training sessions.",
    images: ["/src/assets/awscc-banner.png"]
  }
};