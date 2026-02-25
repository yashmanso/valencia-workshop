"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { NameInput } from "@/components/NameInput"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user already has a name stored
    if (typeof window !== "undefined") {
      const userName = localStorage.getItem("workshopUserName")
      if (userName) {
        router.push("/workshop")
      }
    }
  }, [router])

  return <NameInput />
}
