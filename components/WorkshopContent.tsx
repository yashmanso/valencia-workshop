"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Workshop } from "@/lib/markdown"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface WorkshopContentProps {
  workshop: Workshop
}

// Custom component to render HTML with input fields
function renderWorkshopContent(
  htmlContent: string,
  formData: Record<string, string>,
  setFormData: (data: Record<string, string>) => void
): React.ReactNode {
  // Parse HTML and replace input placeholders
  // Match: <div data-input-placeholder="type" data-field-name="field name"></div>
  // Also check for HTML comments as fallback
  const placeholderRegex = /<div data-input-placeholder="(\w+)" data-field-name="([^"]+)"><\/div>/g
  const commentRegex = /<!-- INPUT_PLACEHOLDER:(\w+):([^>]+) -->/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let inputIndex = 0
  let hasPlaceholders = false

  // Reset regex to search from beginning
  placeholderRegex.lastIndex = 0
  commentRegex.lastIndex = 0
  
  // Try data attribute divs first
  while ((match = placeholderRegex.exec(htmlContent)) !== null) {
    hasPlaceholders = true
    // Add HTML before the placeholder
    if (match.index > lastIndex) {
      const htmlBefore = htmlContent.substring(lastIndex, match.index)
      if (htmlBefore.trim()) {
        parts.push(
          <div
            key={`html-${inputIndex}`}
            className="prose prose-lg max-w-none dark:prose-invert [&_p]:mb-6 [&_li]:mb-3"
            dangerouslySetInnerHTML={{ __html: htmlBefore }}
          />
        )
      }
    }

    // Add the input field
    const inputType = match[1]
    const fieldName = match[2].trim()
    const fieldId = `input-${inputIndex++}`

    parts.push(
      <div key={fieldId} className="my-4">
        <Label htmlFor={fieldId} className="mb-2 block">
          {fieldName}
        </Label>
        <Textarea
          id={fieldId}
          name={fieldName}
          value={formData[fieldName] || ""}
          onChange={(e) =>
            setFormData({ ...formData, [fieldName]: e.target.value })
          }
          className="min-h-[120px]"
          placeholder={`Enter your response for ${fieldName}`}
        />
      </div>
    )

    lastIndex = match.index + match[0].length
  }
  
  // If no data attribute divs found, try HTML comments
  if (!hasPlaceholders) {
    commentRegex.lastIndex = 0
    lastIndex = 0
    while ((match = commentRegex.exec(htmlContent)) !== null) {
      hasPlaceholders = true
      // Add HTML before the placeholder
      if (match.index > lastIndex) {
        const htmlBefore = htmlContent.substring(lastIndex, match.index)
        if (htmlBefore.trim()) {
          parts.push(
            <div
              key={`html-comment-${inputIndex}`}
              className="prose prose-lg max-w-none dark:prose-invert [&_p]:mb-6 [&_li]:mb-3"
              dangerouslySetInnerHTML={{ __html: htmlBefore }}
            />
          )
        }
      }

      // Add the input field
      const inputType = match[1]
      const fieldName = match[2].trim()
      const fieldId = `input-comment-${inputIndex++}`

      parts.push(
        <div key={fieldId} className="my-4">
          <Label htmlFor={fieldId} className="mb-2 block">
            {fieldName}
          </Label>
          <Textarea
            id={fieldId}
            name={fieldName}
            value={formData[fieldName] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [fieldName]: e.target.value })
            }
            className="min-h-[120px]"
            placeholder={`Enter your response for ${fieldName}`}
          />
        </div>
      )

      lastIndex = match.index + match[0].length
    }
  }

  // Add remaining HTML (or all HTML if no placeholders found)
  const remainingContent = hasPlaceholders 
    ? htmlContent.substring(lastIndex)
    : htmlContent
    
  if (remainingContent.trim()) {
    parts.push(
      <div
        key="html-end"
        className="prose prose-lg max-w-none dark:prose-invert [&_p]:mb-6 [&_li]:mb-3"
        dangerouslySetInnerHTML={{ __html: remainingContent }}
      />
    )
  }

  // If no parts were created, render the full HTML
  if (parts.length === 0 && htmlContent.trim()) {
    return (
      <div
        className="prose prose-lg max-w-none dark:prose-invert [&_p]:mb-6 [&_li]:mb-3"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    )
  }

  return <>{parts}</>
}

export function WorkshopContent({ workshop }: WorkshopContentProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [userName, setUserName] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState<
    Array<{
      savedAt: string
      responses: Record<string, string>
    }>
  >([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("workshopUserName") || ""
      setUserName(name)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedName = userName.trim()
    if (!trimmedName) {
      toast({
        title: "error",
        description: "please enter your name before saving.",
        variant: "destructive",
      })
      router.push("/?change=true")
      return
    }

    const hasAnyResponse = Object.values(formData).some((value) => value?.trim())
    if (!hasAnyResponse) {
      toast({
        title: "error",
        description: "please write a response before saving.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/save-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: trimmedName,
          workshopTitle: workshop.frontmatter.title,
          workshopSlug: workshop.frontmatter.slug,
          responses: formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error:", errorData)
        throw new Error(errorData.error || "Failed to save response")
      }

      await response.json()

      const savedAt = new Date().toISOString()
      setSubmissions((prev) => [{ savedAt, responses: { ...formData } }, ...prev])
      setFormData({})

      toast({
        title: "submitted",
        description: "your response has been submitted.",
      })
    } catch (error) {
      console.error("Error saving response:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save your response. Please try again."
      toast({
        title: "error",
        description: errorMessage.toLowerCase(),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Always check raw content for input placeholders and render them
  const rawInputMatches = workshop.content.match(/\[INPUT:(\w+):([^\]]+)\]/g);
  const latestSubmission = submissions[0]
  
  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          {renderWorkshopContent(workshop.htmlContent, formData, setFormData)}

          {!userName.trim() && (
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-foreground">
                name is missing. please set your name to save responses.
              </p>
              <div className="mt-3">
                <Button variant="outline" asChild>
                  <Link href="/?change=true">set name</Link>
                </Button>
              </div>
            </div>
          )}

          {latestSubmission && (
            <div className="mt-6 space-y-3">
              <div className="rounded-lg border border-border bg-green-50/70 dark:bg-green-950/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  submitted
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(latestSubmission.savedAt).toLocaleString()}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground mb-2">
                  sent response
                </p>
                <div className="space-y-3">
                  {Object.entries(latestSubmission.responses)
                    .filter(([, value]) => value?.trim())
                    .map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          {key}
                        </p>
                        <div className="whitespace-pre-wrap text-sm text-foreground">
                          {value}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Always render input fields from raw content */}
          {rawInputMatches && rawInputMatches.map((match, idx) => {
            const inputMatch = match.match(/\[INPUT:(\w+):([^\]]+)\]/);
            if (!inputMatch) return null;
            const fieldName = inputMatch[2].trim();
            const fieldId = `input-${fieldName.replace(/\s+/g, '-').toLowerCase()}-${idx}`;
            
            return (
              <div key={fieldId} className="my-6">
                <Textarea
                  id={fieldId}
                  name={fieldName}
                  value={formData[fieldName] || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, [fieldName]: e.target.value })
                  }
                  className="min-h-[150px] w-full"
                  placeholder=""
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "saving..." : "save response"}
          </Button>
        </div>
      </form>
    </>
  )
}
