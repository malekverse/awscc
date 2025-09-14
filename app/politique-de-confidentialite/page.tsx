import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Privacy Policy | AWS Cloud Club ISIMS",
  description: "Privacy Policy of AWS Cloud Club ISIMS",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] text-transparent bg-clip-text">
            Privacy Policy
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})}
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              AWS Cloud Club ISIMS ("we", "our", "us") is committed to protecting your privacy. This privacy policy explains how we collect, use, disclose, and protect your personal information when you interact with our website, participate in our events, or join our club.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            <p>
              We may collect the following types of information:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li><strong>Identification information</strong>: name, surname, email address, phone number</li>
              <li><strong>Academic information</strong>: institution, level of study, specialization</li>
              <li><strong>Professional information</strong>: experience, certifications, skills</li>
              <li><strong>Preferences</strong>: technological interests, availability</li>
              <li><strong>Communication data</strong>: messages you send us through our contact form</li>
              <li><strong>Technical data</strong>: IP address, browser type, device used to access the site</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <p>
              We use your personal information to:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Manage your club membership</li>
              <li>Inform you about our events, workshops, and activities</li>
              <li>Personalize your experience within the club</li>
              <li>Improve our website and services</li>
              <li>Communicate with you regarding the club</li>
              <li>Respond to your questions and requests</li>
              <li>Comply with our legal obligations</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
            <p>
              We do not sell your personal data to third parties. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>With club board members for activity management</li>
              <li>With trusted partners who help us organize events (with your consent)</li>
              <li>With service providers who help us manage our website and communications</li>
              <li>If required by law or to protect our legal rights</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Protection of Your Information</h2>
            <p>
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is completely secure, and we cannot guarantee absolute security.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
            <p>
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>Right to access your personal data</li>
              <li>Right to rectify inaccurate data</li>
              <li>Right to erasure of your data ("right to be forgotten")</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw your consent at any time</li>
            </ul>
            <p>
              To exercise these rights, please contact us at the email address indicated below.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to achieve the purposes described in this privacy policy, unless a longer retention period is required or permitted by law.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cookies and Similar Technologies</h2>
            <p>
              Our website may use cookies and similar technologies to enhance your browsing experience. You can configure your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Links to Other Sites</h2>
            <p>
              Our website may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the privacy policy of every site you visit.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "last updated" date.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at:
            </p>
            <p className="mb-6">
              <strong>AWS Cloud Club ISIMS</strong><br />
              Email: awscloudclubisims@gmail.com<br />
              Address: ISIMS, Al Ons, Sfax
            </p>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/">
              <Button variant="outline" className="mr-4">Back to Home</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}