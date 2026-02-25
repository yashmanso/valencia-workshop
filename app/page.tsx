"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { NameInput } from "@/components/NameInput"

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if user wants to change name (from query param or if no name exists)
    const changeName = searchParams.get("change") === "true"
    
    if (typeof window !== "undefined") {
      if (changeName) {
        // Clear the name if user wants to change it
        localStorage.removeItem("workshopUserName")
        setIsReady(true)
      } else {
        const userName = localStorage.getItem("workshopUserName")
        if (userName) {
          router.push("/workshop")
        } else {
          setIsReady(true)
        }
      }
    }
  }, [router, searchParams])

  if (!isReady) {
    return null // Prevent flash of content
  }

  return <NameInput />
}
