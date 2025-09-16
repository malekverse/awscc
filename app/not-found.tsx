import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CloudShape } from "@/components/ui/cloud-shape";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-16 pt-24 md:pt-24 pb-16 md:pb-20 min-h-[calc(100vh-200px)] relative overflow-hidden">
        {/* Wool texture background overlay */}
          <div className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-repeat" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239B6DFF' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: 'clamp(80px, 10vw, 150px)'
            }}
          ></div>
        
        {/* Cloud shapes - responsive sizes */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <CloudShape 
            size={80} 
            className="absolute top-20 left-[5%] sm:left-[10%] opacity-40 sm:hidden" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={120} 
            className="absolute top-20 left-[10%] opacity-40 hidden sm:block" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={60} 
            className="absolute top-40 right-[10%] sm:right-[15%] opacity-30 sm:hidden" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={80} 
            className="absolute top-40 right-[15%] opacity-30 hidden sm:block" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={70} 
            className="absolute bottom-20 left-[15%] sm:left-[20%] opacity-50 sm:hidden" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={100} 
            className="absolute bottom-20 left-[20%] opacity-50 hidden sm:block" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={100} 
            className="absolute -bottom-10 right-[5%] opacity-40 sm:hidden" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={150} 
            className="absolute -bottom-10 right-[5%] opacity-40 hidden sm:block" 
            fill="#E9E1FF" 
          />
          <CloudShape 
            size={50} 
            className="absolute bottom-1/3 left-[15%] opacity-30 hidden md:block" 
            fill="#F0EBFF" 
          />
        </div>
        
        {/* Wool ball */}
        <div className="absolute top-1/3 right-[15%] z-0 hidden md:block" 
          style={{animation: 'wool-bounce 4s ease-in-out infinite'}}>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#9B6DFF] to-[#4263EB] shadow-lg">
            {/* Wool texture */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="wool-ball-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M0,5 C2.5,5 2.5,0 5,0 C7.5,0 7.5,5 10,5" 
                        stroke="white" 
                        strokeWidth="1" 
                        fill="none" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#wool-ball-pattern)" />
              </svg>
            </div>
            {/* Thread coming out */}
            <div className="absolute -bottom-12 -left-12 w-24 h-24">
              <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M80,20 Q50,50 70,80" 
                      stroke="#9B6DFF" 
                      strokeWidth="3" 
                      fill="none" 
                      strokeDasharray="5,5" 
                      strokeDashoffset="0" 
                      className="animate-dash-offset-reverse" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Mobile wool ball (smaller and positioned differently) */}
        <div className="absolute top-1/4 right-[10%] z-0 block md:hidden" 
          style={{animation: 'wool-bounce 4s ease-in-out infinite'}}>
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#9B6DFF] to-[#4263EB] shadow-lg">
            {/* Wool texture */}
            <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <pattern id="wool-ball-pattern-mobile" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M0,4 C2,4 2,0 4,0 C6,0 6,4 8,4" 
                        stroke="white" 
                        strokeWidth="1" 
                        fill="none" />
                </pattern>
                <rect x="0" y="0" width="100%" height="100%" fill="url(#wool-ball-pattern-mobile)" />
              </svg>
            </div>
            {/* Thread coming out */}
            <div className="absolute -bottom-8 -left-8 w-16 h-16">
              <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M80,20 Q50,50 70,80" 
                      stroke="#9B6DFF" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeDasharray="4,4" 
                      strokeDashoffset="0" 
                      className="animate-dash-offset-reverse" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Wool ball with 404 */}
          <div className="mb-8 relative inline-block">
            <div className="relative">
              <div 
                className="w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 mx-auto rounded-full bg-gradient-to-br from-[#E9E1FF] to-[#D8C4FF] shadow-lg overflow-hidden relative" 
                style={{animation: 'wool-bounce 4s ease-in-out infinite'}}
              >
                <div className="absolute inset-0 opacity-30">
                  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="wool-pattern" patternUnits="userSpaceOnUse" width="20" height="20">
                        <path d="M0,10 Q5,0 10,10 Q15,20 20,10" stroke="#9B6DFF" fill="none" strokeWidth="2" strokeDasharray="40" strokeDashoffset="0">
                          <animate attributeName="stroke-dashoffset" from="0" to="40" dur="3s" repeatCount="indefinite" />
                        </path>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#wool-pattern)" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text animate-pulse-glow">
                    404
                  </h1>
                </div>
                
                {/* Wool texture overlay */}
                <div className="absolute inset-0 bg-repeat opacity-20" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627,12.724c0.954,1.26,1.908,2.52,2.861,3.78c-1.908-1.26-3.815-2.52-5.723-3.78C52.719,12.724,53.673,12.724,54.627,12.724z M22.025,12.724c0.954,0,1.908,0,2.861,0c-1.908,1.26-3.815,2.52-5.723,3.78C20.117,15.244,21.071,13.984,22.025,12.724z M12.533,22.215c1.26-0.954,2.52-1.908,3.78-2.861c-1.26,1.908-2.52,3.815-3.78,5.723C12.533,24.123,12.533,23.169,12.533,22.215z M12.533,54.817c0-0.954,0-1.908,0-2.861c1.26,1.908,2.52,3.815,3.78,5.723C15.052,56.725,13.793,55.771,12.533,54.817z M45.135,57.678c1.26-1.908,2.52-3.815,3.78-5.723c0,0.954,0,1.908,0,2.861C47.655,55.771,46.395,56.725,45.135,57.678z M51.765,25.076c-1.26-1.908-2.52-3.815-3.78-5.723c1.26,0.954,2.52,1.908,3.78,2.861C51.765,23.169,51.765,24.123,51.765,25.076z M33.579,8.944c0-1.908,0-3.815,0-5.723c0,1.908,0,3.815,0,5.723C33.579,8.944,33.579,8.944,33.579,8.944z M33.579,57.678c0-1.908,0-3.815,0-5.723c0,0,0,0,0,0C33.579,53.863,33.579,55.771,33.579,57.678z M8.753,33.401c-1.908,0-3.815,0-5.723,0c1.908,0,3.815,0,5.723,0C8.753,33.401,8.753,33.401,8.753,33.401z M57.487,33.401c-1.908,0-3.815,0-5.723,0c0,0,0,0,0,0C53.673,33.401,55.58,33.401,57.487,33.401z' fill='%239B6DFF' fill-opacity='0.5' /%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                  }}
                ></div>
              </div>
              
              {/* Wool thread */}
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-1.5 sm:w-2 h-16 sm:h-20 bg-gradient-to-b from-[#9B6DFF] to-[#E9E1FF] rounded-full animate-float"></div>
              
              {/* Loose wool threads */}
              <svg className="absolute -bottom-4 left-1/4 w-12 h-12 sm:w-16 sm:h-16 opacity-70" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,0 Q60,40 40,80 Q50,90 60,100" stroke="#9B6DFF" fill="none" strokeWidth="3" strokeDasharray="200" strokeDashoffset="0">
                  <animate attributeName="stroke-dashoffset" from="0" to="200" dur="8s" repeatCount="indefinite" />
                </path>
              </svg>
              
              <svg className="absolute -bottom-4 right-1/4 w-12 h-12 sm:w-16 sm:h-16 opacity-70" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <path d="M50,0 Q30,30 50,60 Q40,80 30,100" stroke="#7C4DFF" fill="none" strokeWidth="3" strokeDasharray="200" strokeDashoffset="0">
                  <animate attributeName="stroke-dashoffset" from="0" to="200" dur="6s" repeatCount="indefinite" />
                </path>
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Oops! This yarn leads nowhere
          </h2>
          
          <p className="text-lg md:text-xl mb-8 max-w-lg mx-auto text-muted-foreground">
            The page you're looking for seems to have unraveled. Our wool pattern couldn't weave together what you were searching for.
          </p>
          
          <div className="flex items-center justify-center mb-8">
            <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-[#9B6DFF]/50"></div>
            <div className="px-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#9B6DFF]">
                <path d="M12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4S14.21,8,12,8z M12,14c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S13.1,14,12,14z" fill="currentColor"/>
                <path d="M18,4c-2.21,0-4,1.79-4,4c0,0.34,0.04,0.67,0.13,0.98C13.46,9.65,12.75,10,12,10c-0.75,0-1.46-0.35-1.93-0.98 C10.16,8.67,10.21,8.34,10.21,8c0-2.21-1.79-4-4-4C3.58,4,1.21,6.37,1.21,9.21c0,2.83,2.37,5.21,5.21,5.21 c0.75,0,1.46-0.17,2.12-0.47C9.5,15.19,10.68,16,12,16c1.32,0,2.5-0.81,2.97-2.05c0.66,0.3,1.37,0.47,2.12,0.47 c2.83,0,5.21-2.37,5.21-5.21C22.21,6.37,20.83,4,18,4z M6.21,12.42c-1.78,0-3.21-1.43-3.21-3.21c0-1.78,1.43-3.21,3.21-3.21 s3.21,1.43,3.21,3.21C9.42,10.99,7.99,12.42,6.21,12.42z M18,12.42c-1.78,0-3.21-1.43-3.21-3.21c0-1.78,1.43-3.21,3.21-3.21 s3.21,1.43,3.21,3.21C21.21,10.99,19.78,12.42,18,12.42z" fill="currentColor"/>
              </svg>
            </div>
            <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-[#9B6DFF]/50"></div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild
              className="bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] hover:opacity-90 text-white relative overflow-hidden group"
            >
              <Link href="/" className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" fill="currentColor"/>
                </svg>
                <span className="relative z-10">Return Home</span>
                <span className="absolute inset-0 bg-repeat opacity-0 group-hover:opacity-10 transition-opacity duration-300" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q10,0 20,20 Q30,40 40,20' stroke='white' fill='none' stroke-width='2' /%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                  }}></span>
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              className="border-primary hover:bg-primary/10 transition-colors relative overflow-hidden group"
            >
              <Link href="/#contact" className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#9B6DFF]">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                </svg>
                <span className="relative z-10">Contact Us</span>
                <span className="absolute inset-0 bg-repeat opacity-0 group-hover:opacity-10 transition-opacity duration-300" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q10,0 20,20 Q30,40 40,20' stroke='%239B6DFF' fill='none' stroke-width='2' /%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                  }}></span>
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}