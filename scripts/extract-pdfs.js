const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfsDir = path.join(__dirname, '..', 'pdfs');
const workshopsDir = path.join(__dirname, '..', 'content', 'workshops');

// Map PDF filenames to markdown slugs
const pdfToSlug = {
  'Step 0.pdf': 'step-0',
  'Step 1.pdf': 'step-1',
  'Step 2.pdf': 'step-2',
  'Step 3.pdf': 'step-3',
  'Option 1.pdf': 'option-1',
  'Option 2.pdf': 'option-2',
  'Option 3.pdf': 'option-3',
};

async function extractPDFContent(pdfPath, slug) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    
    // Extract text and clean it up
    let content = data.text
      .replace(/\n{3,}/g, '\n\n') // Remove excessive newlines
      .trim();
    
    // Split into lines
    const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // First non-empty line is the title
    const title = lines[0] || slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    
    // Remove "your name:" lines and clean up
    let processedLines = lines.slice(1) // Skip title line
      .filter(line => !line.toLowerCase().includes('your name:'))
      .filter(line => !line.toLowerCase().startsWith('your name'))
      .map(line => line.trim());
    
    // Reconstruct content, adding input box at the end
    let markdownContent = processedLines.join('\n\n');
    
    // Add input box at the end if there isn't one already
    if (!markdownContent.includes('[INPUT:')) {
      markdownContent += '\n\n[INPUT:textarea:Your Response]';
    }
    
    // Create frontmatter with extracted title
    const frontmatter = `---
title: "${title}"
slug: "${slug}"
tags: []
---

`;
    
    const mdPath = path.join(workshopsDir, `${slug}.md`);
    const fullContent = frontmatter + markdownContent;
    fs.writeFileSync(mdPath, fullContent, 'utf8');
    
    console.log(`✓ Extracted content from ${path.basename(pdfPath)} to ${slug}.md`);
    console.log(`  Title: "${title}"`);
    return true;
  } catch (error) {
    console.error(`✗ Error extracting ${pdfPath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Starting PDF extraction...\n');
  
  const pdfFiles = fs.readdirSync(pdfsDir).filter(f => f.endsWith('.pdf'));
  
  for (const pdfFile of pdfFiles) {
    const slug = pdfToSlug[pdfFile];
    if (!slug) {
      console.log(`⚠ Skipping ${pdfFile} - no slug mapping found`);
      continue;
    }
    
    const pdfPath = path.join(pdfsDir, pdfFile);
    await extractPDFContent(pdfPath, slug);
  }
  
  console.log('\n✓ PDF extraction complete!');
  console.log('Note: You may need to manually format the markdown and add [INPUT:textarea:Field Name] placeholders where needed.');
}

main().catch(console.error);
