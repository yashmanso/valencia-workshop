import { getWorkshopBySlug, getWorkshopSlugs } from "@/lib/markdown"
import { WorkshopContent } from "@/components/WorkshopContent"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export async function generateStaticParams() {
  const slugs = getWorkshopSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

export default function WorkshopDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const workshop = getWorkshopBySlug(params.slug)

  if (!workshop) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/workshop">
            <Button variant="outline">← Back to Workshops</Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{workshop.frontmatter.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkshopContent workshop={workshop} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
