# SEO Guidelines for AWS Cloud Club ISIMS Website

This document outlines the SEO best practices implemented in this project and provides guidance for maintaining good SEO when adding new pages or content.

## Implemented SEO Features

### Metadata

- **Page-specific metadata**: Each page has its own metadata file (`metadata.ts`) with:
  - Custom title and description
  - Relevant keywords
  - Open Graph tags for social sharing
  - Twitter card metadata

### Structured Data

- **JSON-LD**: Enhanced structured data with:
  - Organization schema
  - Website schema
  - Dynamic breadcrumb schema

### Technical SEO

- **robots.txt**: Controls crawler access
- **sitemap.xml**: Helps search engines discover all pages
- **Security headers**: Implemented in next.config.mjs
- **Performance optimizations**: Compression enabled

## Best Practices for New Pages

### Creating Metadata for New Pages

1. Create a `metadata.ts` file in the page directory with this structure:

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Title | AWS Cloud Club ISIMS",
  description: "Compelling description under 160 characters that includes keywords and encourages clicks.",
  keywords: [
    "relevant keyword 1",
    "relevant keyword 2",
    // Add 5-10 relevant keywords
  ],
  openGraph: {
    title: "Page Title | AWS Cloud Club ISIMS",
    description: "Same or similar description as above.",
    images: [
      {
        url: "/src/assets/awscc-banner.png", // Use relevant image
        width: 1200,
        height: 630,
        alt: "Descriptive alt text"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Page Title | AWS Cloud Club ISIMS",
    description: "Same or similar description as above.",
    images: ["/src/assets/awscc-banner.png"]
  }
};
```

### Content Guidelines

1. **Use semantic HTML**: Proper heading hierarchy (h1, h2, h3, etc.)
2. **Optimize images**: Include alt text and descriptive filenames
3. **Internal linking**: Link to relevant pages within the site
4. **Mobile-friendly**: Ensure responsive design for all devices
5. **Page speed**: Keep pages lightweight and fast-loading

### After Adding New Pages

1. Update the sitemap.xml with the new page URL
2. Test the page with tools like Lighthouse or Google's Mobile-Friendly Test

## Monitoring and Maintenance

1. Regularly check Google Search Console for issues
2. Update content to keep it fresh and relevant
3. Monitor page performance and make improvements as needed
4. Keep structured data up to date

## Tools for SEO Testing

- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Structured Data Testing Tool](https://validator.schema.org/)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)

---

By following these guidelines, we can maintain strong SEO practices across the AWS Cloud Club ISIMS website.