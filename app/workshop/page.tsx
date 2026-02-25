import { getAllWorkshops } from "@/lib/markdown"
import { WorkshopButton } from "@/components/WorkshopButton"
import Link from "next/link"

export default function WorkshopPage() {
  const workshops = getAllWorkshops()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Workshop in Valencia
          </h1>
          <p className="text-gray-600">
            Select a workshop to begin
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workshops.map((workshop) => (
            <WorkshopButton
              key={workshop.frontmatter.slug}
              title={workshop.frontmatter.title}
              slug={workshop.frontmatter.slug}
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            Change name
          </Link>
        </div>
      </div>
    </div>
  )
}
