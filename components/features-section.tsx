import { Cloud, Database, Code } from "lucide-react"
import { StarIcon } from "@/components/ui/star-icon"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeaturesSection() {
  return (
    <section
      id="features"
      className=" space-y-6 bg-white bg-secondary/20 py-8 dark:bg-transparent md:py-12 lg:py-24 rounded-xl my-8 relative"
    >
      <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
        <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl font-bold bg-gradient-to-r from-[var(--primary-gradient-from)] to-[var(--primary-gradient-to)] text-transparent bg-clip-text">
          Nos Activités
        </h2>
        <p className="max-w-[85%] leading-normal text-foreground sm:text-lg sm:leading-7">
          Découvrez les différentes activités proposées par notre club AWS Cloud.
        </p>
      </div>
      <div className="mx-auto grid justify-center gap-6 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
        <Card className="group">
          <CardHeader>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-4 group-hover:bg-primary/10 transition-colors duration-300">
              <Cloud className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">Cloud Computing</CardTitle>
            <CardDescription className="text-foreground/80">
              Exploration des services AWS et architectures cloud.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Apprenez à déployer, gérer et optimiser des applications dans le cloud AWS à travers des ateliers pratiques.</p>
          </CardContent>
        </Card>
        <Card className="group">
          <CardHeader>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-4 group-hover:bg-primary/10 transition-colors duration-300">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">Big Data & IA</CardTitle>
            <CardDescription className="text-foreground/80">
              Analyse de données et intelligence artificielle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Explorez les technologies de traitement de données massives et d'intelligence artificielle sur AWS.</p>
          </CardContent>
        </Card>
        <Card className="group">
          <CardHeader>
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-secondary mb-4 group-hover:bg-primary/10 transition-colors duration-300">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-bold">DevOps</CardTitle>
            <CardDescription className="text-foreground/80">
              Automatisation, CI/CD et infrastructure as code.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Maîtrisez les pratiques DevOps modernes et les outils d'automatisation pour le déploiement continu sur AWS.</p>
          </CardContent>
        </Card>
      </div>
      <div className="absolute right-10 bottom-10">
        <StarIcon size={24} fill="#FF9900" className="animate-pulse-glow" />
      </div>
    </section>
  )
}