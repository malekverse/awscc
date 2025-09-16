"use client";

import { Organization, WithContext, Event, WebSite, BreadcrumbList } from "schema-dts";
import { usePathname } from "next/navigation";

export default function JsonLd() {
  const pathname = usePathname();
  
  // Organization schema
  const organizationSchema: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "AWS Cloud Club ISIMS",
    alternateName: "AWSCC ISIMS",
    url: "https://awscc.tn",
    logo: {
      "@type": "ImageObject",
      url: "https://awscc.tn/src/assets/logo.jpg",
      width: "180",
      height: "180"
    },
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
      telephone: "+216-94-181-481",
      contactType: "student support",
      email: "awscloudclubisims@gmail.com",
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

  // Website schema
  const websiteSchema: WithContext<WebSite> = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "AWS Cloud Club ISIMS",
    url: "https://awscc.tn",
    description: "AWS Cloud Club ISIMS – A student-led community focused on AWS technologies, cloud computing, DevOps, and AI.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://awscc.tn/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // Breadcrumb schema
  const getBreadcrumbSchema = () => {
    if (pathname === "/") return null;
    
    const pathSegments = pathname.split("/").filter(segment => segment);
    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://awscc.tn"
      }
    ];

    let currentPath = "";
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbItems.push({
        "@type": "ListItem",
        position: index + 2,
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        item: `https://awscc.tn${currentPath}`
      });
    });

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems
    } as WithContext<BreadcrumbList>;
  };

  const breadcrumbSchema = getBreadcrumbSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}
