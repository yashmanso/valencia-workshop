"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
            className="prose prose-lg max-w-none dark:prose-invert"
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
              className="prose prose-lg max-w-none dark:prose-invert"
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
        className="prose prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: remainingContent }}
      />
    )
  }

  // If no parts were created, render the full HTML
  if (parts.length === 0 && htmlContent.trim()) {
    return (
      <div
        className="prose prose-lg max-w-none dark:prose-invert"
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
  const [showSuccess, setShowSuccess] = useState(false)
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
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/save-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName,
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

      const result = await response.json()

      // Show success modal
      setShowSuccess(true)

      // Redirect to home after 5 seconds
      setTimeout(() => {
        router.push("/")
      }, 5000)
    } catch (error) {
      console.error("Error saving response:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save your response. Please try again."
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  // Always check raw content for input placeholders and render them
  const rawInputMatches = workshop.content.match(/\[INPUT:(\w+):([^\]]+)\]/g);
  
  return (
    <>
      <form onSubmit={handleSubmit} className={`space-y-6 ${showSuccess ? 'blur-sm pointer-events-none' : ''}`}>
        <div>
          {renderWorkshopContent(workshop.htmlContent, formData, setFormData)}
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
            {isSubmitting ? "Saving..." : "Save Response"}
          </Button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-card border border-border rounded-lg shadow-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Success!</h2>
              <p className="text-muted-foreground">
                Your response has been saved to GitHub.
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Redirecting to home in 5 seconds...
            </p>
          </div>
        </div>
      )}
    </>
  )
}
