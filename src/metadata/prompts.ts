/**
 * Optimized prompts for KDP metadata generation
 */

export const PROMPTS = {
  title: (niche: string, style?: string) => `
You are an expert Amazon KDP book title writer. Generate 5 unique, catchy, and SEO-friendly book titles for a ${style || 'notebook/journal'} in the "${niche}" niche.

Requirements:
- Titles should be 3-8 words
- Include relevant keywords naturally
- Make them compelling and marketable
- Avoid generic titles

Format your response as a JSON array with exactly 5 titles:
["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
`,

  subtitle: (title: string, niche: string) => `
You are an expert Amazon KDP book subtitle writer. Create a compelling subtitle for this book title: "${title}"
in the "${niche}" niche.

Requirements:
- Subtitle should be 5-12 words
- Should complement the title
- Should include relevant keywords
- Should hint at the book's value/benefit
- Should NOT repeat the main title

Respond with ONLY the subtitle text, no quotes or formatting.
`,

  keywords: (title: string, niche: string) => `
You are an expert Amazon KDP backend keywords specialist. Generate 7 highly relevant backend keywords for this book:
- Title: "${title}"
- Niche: "${niche}"

Requirements:
- Each keyword should be 1-3 words
- Focus on search volume and relevance
- Include long-tail keywords
- Avoid duplicates and variations of each other
- Consider what customers actually search for

Format your response as a JSON array with exactly 7 keywords:
["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7"]
`,

  description: (title: string, subtitle: string, niche: string, keywords: string[]) => `
You are an expert Amazon KDP product description writer. Write a compelling HTML-formatted product description for this book.

Book Details:
- Title: "${title}"
- Subtitle: "${subtitle}"
- Niche: "${niche}"
- Keywords: ${keywords.join(', ')}

Requirements:
- 150-300 words
- Start with a hook that appeals to the target customer
- Highlight key features and benefits
- Use HTML formatting: <h2>, <p>, <strong>, <ul>, <li>
- Include a call-to-action
- Naturally incorporate keywords
- Focus on customer pain points and solutions

Respond with ONLY the HTML content, no markdown or extra formatting.
`,
};
