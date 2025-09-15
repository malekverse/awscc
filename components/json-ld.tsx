import { Organization, WithContext } from "schema-dts";

export default function JsonLd() {
  const jsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AWS Cloud Club ISIMS",
    alternateName: "AWSCC ISIMS",
    url: "https://awscc.tn",
    logo: "https://awscc.tn/src/assests/logo.jpg", // Make sure this path is correct
    sameAs: [
      "https://www.facebook.com/people/AWS-Cloud-Club-ISIMS/61558406757136",
      "https://www.instagram.com/awscc_isims",
      "https://www.linkedin.com/company/102401226/",
    ],
    description: "AWS Cloud Club ISIMS – A student-led community focused on AWS technologies, cloud computing, DevOps, and AI. Join us to learn, build, and grow your cloud skills.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "ISIMS - Institut Supérieur d'Informatique et de Multimédia de Sfax",
      addressLocality: "Sfax",
      addressRegion: "Sfax",
      postalCode: "3021",
      addressCountry: "TN"
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+216-94-181-481", // Replace with a real number if available
      contactType: "student support",
      email: "awscloudclubisims@gmail.com", // Replace with real email
      availableLanguage: ["English", "French"]
    },
    foundingDate: "2023",
    keywords: "AWS, Cloud Computing, ISIMS, DevOps, AI, Student Club, AWSCC, Tunisia, Technology, Education",
    knowsAbout: ["AWS", "Cloud Computing", "DevOps", "Artificial Intelligence", "STEM", "Software Development"],
    member: {
      "@type": "EducationalOrganization",
      name: "ISIMS"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
