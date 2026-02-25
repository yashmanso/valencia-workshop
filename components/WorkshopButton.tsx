"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface WorkshopButtonProps {
  title: string
  slug: string
}

export function WorkshopButton({ title, slug }: WorkshopButtonProps) {
  return (
    <Link href={`/workshop/${slug}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full">
            Start Workshop
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
