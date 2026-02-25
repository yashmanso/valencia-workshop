import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userName, workshopTitle, workshopSlug, responses } = body

    // Validate required fields
    if (!userName || !workshopTitle || !workshopSlug) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get environment variables
    const githubToken = process.env.GITHUB_TOKEN
    const repoOwner = process.env.GITHUB_REPO_OWNER
    const repoName = process.env.GITHUB_REPO_NAME
    const branch = process.env.GITHUB_BRANCH || "main"

    if (!githubToken || !repoOwner || !repoName) {
      return NextResponse.json(
        { error: "GitHub credentials not configured. Please set GITHUB_TOKEN, GITHUB_REPO_OWNER, and GITHUB_REPO_NAME in your environment variables." },
        { status: 500 }
      )
    }

    // Format the response content
    const timestamp = new Date().toISOString()
    const content = `Workshop Response
================

User Name: ${userName}
Workshop: ${workshopTitle}
Date: ${timestamp}

Responses:
${Object.entries(responses)
  .map(([key, value]) => `\n${key}:\n${value}\n`)
  .join("\n---\n")}
`

    // Create folder for this response
    const sanitizedUserName = userName.replace(/[^a-zA-Z0-9]/g, "_")
    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-")
    const responseFolderName = `${sanitizedUserName}_${workshopSlug}_${timestampStr}`
    const responseFolderPath = `responses/${responseFolderName}`
    const fileName = `response.txt`
    const filePath = `${responseFolderPath}/${fileName}`

    // Convert content to base64 (GitHub API requires base64 encoding)
    const contentBase64 = Buffer.from(content, "utf-8").toString("base64")

    // Create file in GitHub repository
    const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`
    
    const response = await fetch(githubApiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Add response from ${userName} for ${workshopTitle}`,
        content: contentBase64,
        branch: branch,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("GitHub API error:", errorData)
      const errorMessage = errorData.message || errorData.error?.message || "Failed to save response to GitHub"
      return NextResponse.json(
        { error: errorMessage, details: errorData },
        { status: response.status }
      )
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      filePath: result.content.path,
      folderPath: responseFolderPath,
      fileName,
      commitSha: result.commit.sha,
    })
  } catch (error) {
    console.error("Error saving to GitHub:", error)
    return NextResponse.json(
      { error: "Failed to save response to GitHub", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
