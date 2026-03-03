import { getAllWorkshops } from "@/lib/markdown"
import { WorkshopButton } from "@/components/WorkshopButton"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WorkshopPage() {
  const workshops = getAllWorkshops()

  const thursdaySlugs = ["step-0", "step-1", "step-2-1", "step-2-2", "step-3"]
  const fridayMorningSlugs = ["option-1", "option-2"]

  const thursdayWorkshops = workshops.filter((workshop) =>
    thursdaySlugs.includes(workshop.frontmatter.slug)
  )

  const fridayMorningWorkshops = workshops.filter((workshop) =>
    fridayMorningSlugs.includes(workshop.frontmatter.slug)
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            workshop in valencia
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            select a workshop to begin
          </p>
        </div>
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            thursday
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {thursdayWorkshops.map((workshop) => (
              <WorkshopButton
                key={workshop.frontmatter.slug}
                title={workshop.frontmatter.title}
                slug={workshop.frontmatter.slug}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            friday morning
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fridayMorningWorkshops.map((workshop) => (
              <WorkshopButton
                key={workshop.frontmatter.slug}
                title={workshop.frontmatter.title}
                slug={workshop.frontmatter.slug}
              />
            ))}
          </div>
        </section>
        <div className="mt-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/?change=true">change name</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
