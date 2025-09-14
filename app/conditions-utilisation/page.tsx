import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Terms of Use | AWS Cloud Club ISIMS",
  description: "Terms of Use of AWS Cloud Club ISIMS",
}

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-[#9B6DFF] to-[#7C4DFF] text-transparent bg-clip-text">
            Terms of Use
          </h1>
          
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})}
            </p>
            
            <p>
              Welcome to the AWS Cloud Club ISIMS website. By accessing this site, you agree to be bound by these terms of use, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. License Usage</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on AWS Cloud Club ISIMS's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 mb-6">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on AWS Cloud Club ISIMS's website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <p>
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by AWS Cloud Club ISIMS at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Disclaimer</h2>
            <p>
              The materials on AWS Cloud Club ISIMS's website are provided "as is". AWS Cloud Club ISIMS makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p>
              Further, AWS Cloud Club ISIMS does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. Limitations</h2>
            <p>
              In no event shall AWS Cloud Club ISIMS or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AWS Cloud Club ISIMS's website, even if AWS Cloud Club ISIMS or an authorized representative of AWS Cloud Club ISIMS has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Revisions and Errors</h2>
            <p>
              The materials appearing on AWS Cloud Club ISIMS's website could include technical, typographical, or photographic errors. AWS Cloud Club ISIMS does not warrant that any of the materials on its website are accurate, complete or current. AWS Cloud Club ISIMS may make changes to the materials contained on its website at any time without notice. AWS Cloud Club ISIMS does not, however, make any commitment to update the materials.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Links</h2>
            <p>
              AWS Cloud Club ISIMS has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AWS Cloud Club ISIMS of the site. Use of any such linked website is at the user's own risk.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Site Terms of Use Modifications</h2>
            <p>
              AWS Cloud Club ISIMS may revise these terms of use for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of use.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Governing Law</h2>
            <p>
              Any claim relating to AWS Cloud Club ISIMS's website shall be governed by the laws of Tunisia without regard to its conflict of law provisions.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Club Membership</h2>
            <p>
              Membership to AWS Cloud Club ISIMS is subject to acceptance of the application by the club board. The club reserves the right to refuse any membership application without having to justify its decision.
            </p>
            <p>
              By submitting a membership application, you agree to abide by the club's rules and code of conduct, to actively participate in club activities when possible, and to represent the club in a positive manner.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Intellectual Property</h2>
            <p>
              Any content created as part of club activities (code, presentations, articles, etc.) remains the intellectual property of its creators, unless explicitly agreed otherwise. The club may request permission to use and share this content for promotional or educational purposes.
            </p>
            <p>
              The name, logo, and trademarks of AWS Cloud Club ISIMS are the property of the club and may not be used without prior written permission.
            </p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about these terms of use, please contact us at:
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