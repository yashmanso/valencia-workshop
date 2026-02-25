  # Workshop in Valencia

An interactive Next.js workshop platform where users can complete workshop exercises and save their responses to Google Drive.

## Features

- Interactive workshop pages with markdown rendering
- User name collection on first visit
- Dynamic workshop selection from markdown files
- Input fields embedded in markdown content
- Automatic saving of responses to GitHub repository
- Modern UI with TailwindCSS and shadcn components

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **shadcn/ui** - Component library
- **remark** - Markdown processing
- **GitHub API** - Response storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Google Cloud Project with Drive API enabled

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "Workshop in Valencia"
```

2. Install dependencies:
```bash
npm install
```

3. Set up GitHub API credentials (see below)

4. Create `.env.local` file with your credentials:
```bash
cp .env.example .env.local
# Edit .env.local with your actual credentials
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## GitHub API Setup

### Step 1: Create a GitHub Personal Access Token

1. Go to GitHub Settings → [Developer settings](https://github.com/settings/developers) → [Personal access tokens](https://github.com/settings/tokens) → [Tokens (classic)](https://github.com/settings/tokens?type=beta)
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a descriptive name (e.g., "Workshop Responses")
4. Select the following scopes:
   - `repo` (Full control of private repositories) - needed to create/update files
5. Click **Generate token**
6. **Copy the token immediately** - you won't be able to see it again!

### Step 2: Create or Choose a Repository

1. Create a new repository on GitHub (or use an existing one)
2. Note the repository owner (your username or organization name)
3. Note the repository name

**Important**: The repository can be public or private. If private, make sure your token has access to it.

### Step 3: Configure Environment Variables

Add all credentials to `.env.local`:

```env
GITHUB_TOKEN=your_personal_access_token_here
GITHUB_REPO_OWNER=your_username_or_org
GITHUB_REPO_NAME=your_repository_name
```

### Step 4: Repository Structure

Responses will be saved in the following structure:
```
responses/
  ├── step-0/
  │   ├── username_step-0_2024-02-25T10-30-00-000Z.txt
  │   └── ...
  ├── step-1/
  ├── option-1/
  └── ...
```

Each response file contains:
- User name
- Workshop title
- Timestamp
- All user responses

## Workshop Content

Workshop markdown files are located in `/content/workshops/`. Each file should:

- Use YAML frontmatter with `title`, `slug`, and optional `tags`
- Include markdown content with instructions
- Use `[INPUT:textarea:Field Name]` syntax for input fields

**Note**: The current markdown files are templates. You need to update them with the actual content from your PDF files. Extract the text, instructions, and structure from each PDF and convert them to markdown format.

Example:
```markdown
---
title: "Step 1"
slug: "step-1"
tags: []
---

# Step 1

## Instructions

Please provide your response below.

[INPUT:textarea:Your Response]
```

### Converting PDFs to Markdown

1. Open each PDF file
2. Extract the title, instructions, and content
3. Convert to markdown format
4. Add input fields using `[INPUT:textarea:Field Name]` where users should provide responses
5. Save to the corresponding file in `/content/workshops/`

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

The app will automatically build and deploy.

### Environment Variables for Production

Make sure to add all environment variables in your Vercel project settings:
- `GITHUB_TOKEN`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`

## Project Structure

```
/
├── app/
│   ├── api/
│   │   └── save-response/     # Google Drive API endpoint
│   ├── workshop/
│   │   ├── page.tsx            # Workshop selection page
│   │   └── [slug]/page.tsx     # Individual workshop page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page (name input)
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # shadcn components
│   ├── NameInput.tsx           # Name collection component
│   ├── WorkshopButton.tsx      # Workshop card button
│   └── WorkshopContent.tsx     # Markdown renderer with inputs
├── content/
│   └── workshops/              # Markdown workshop files
├── lib/
│   ├── markdown.ts             # Markdown processing utilities
│   └── utils.ts                # Utility functions
└── public/                     # Static assets
```

## License

MIT
