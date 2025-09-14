import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkButtonProps {
  href: string
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
}

export function LinkButton({ href, children, variant = "outline", size = "default", className }: LinkButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={cn("group", className)}>
      <Link href={href}>
        {children}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
    </Button>
  )
}
