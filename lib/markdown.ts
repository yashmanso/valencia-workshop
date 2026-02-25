import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import breaks from "remark-breaks";
import fs from "fs";
import path from "path";

export interface WorkshopFrontmatter {
  title: string;
  slug: string;
  tags?: string[];
}

export interface Workshop {
  frontmatter: WorkshopFrontmatter;
  content: string;
  htmlContent: string;
}

const workshopsDirectory = path.join(process.cwd(), "content", "workshops");

export function getWorkshopSlugs(): string[] {
  if (!fs.existsSync(workshopsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(workshopsDirectory);
  return fileNames
    .filter((name) => name.endsWith(".md"))
    .map((name) => name.replace(/\.md$/, ""));
}

export function getWorkshopBySlug(slug: string): Workshop | null {
  const fullPath = path.join(workshopsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Replace input placeholders with HTML divs with data attributes
  // This ensures they're preserved through markdown processing
  const contentWithPlaceholders = content.replace(
    /\[INPUT:(\w+):([^\]]+)\]/g,
    (match, type, fieldName) => {
      // Use a div with data attributes that will be preserved in HTML
      return `\n\n<div data-input-placeholder="${type}" data-field-name="${fieldName.trim()}"></div>\n\n`;
    }
  );

  const processedContent = remark().use(breaks).use(html).processSync(contentWithPlaceholders);
  const htmlContent = processedContent.toString();

  return {
    frontmatter: data as WorkshopFrontmatter,
    content,
    htmlContent,
  };
}

export function getAllWorkshops(): Workshop[] {
  const slugs = getWorkshopSlugs();
  return slugs
    .map((slug) => getWorkshopBySlug(slug))
    .filter((workshop): workshop is Workshop => workshop !== null);
}
