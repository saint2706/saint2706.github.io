import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resumeData } from '../src/data/resume.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '../public/llms.txt');

function generateLLMsText() {
  const { basics, skills, experience, projects, education } = resumeData;

  let content = `# ${basics.name} - ${basics.title}\n\n`;

  // Summary
  content += `## Summary\n${basics.summary}\n\n`;

  // Site Architecture
  content += `## Site Architecture\n`;
  content += `- /: Homepage (Introduction, Highlights)\n`;
  content += `- /projects: Portfolio of work (Data Science, Analytics, Web Dev)\n`;
  content += `- /resume: Professional Experience, Skills, Education\n`;
  content += `- /blog: Technical Articles & Insights\n`;
  content += `- /contact: Get in touch\n`;
  content += `- /games: Interactive mini-games (Snake, Minesweeper)\n`;
  content += `- /playground: Python playground (Pyodide)\n\n`;

  // Key Skills
  content += `## Key Skills\n`;
  skills.forEach(skillCategory => {
    content += `- **${skillCategory.category}**: ${skillCategory.items.map(s => s.name).join(', ')}\n`;
  });
  content += `\n`;

  // Professional Experience
  content += `## Professional Experience\n`;
  experience.forEach(job => {
    content += `### ${job.company} - ${job.position}\n`;
    content += `*${job.startDate} - ${job.endDate || 'Present'} | ${job.location || basics.location.city}*\n`;
    content += `${job.summary}\n`;
    if (job.highlights && job.highlights.length > 0) {
      job.highlights.forEach(h => (content += `- ${h}\n`));
    }
    content += `\n`;
  });

  // Projects
  content += `## Top Projects\n`;
  projects.slice(0, 10).forEach(project => {
    content += `### ${project.title}\n`;
    content += `${project.description}\n`;
    content += `- **Tech Stack**: ${project.tags.join(', ')}\n`;
    if (project.link) content += `- **Demo**: ${project.link}\n`;
    if (project.github) content += `- **Code**: ${project.github}\n`;
    content += `\n`;
  });

  // Education
  content += `## Education\n`;
  education.forEach(edu => {
    content += `- **${edu.institution}**: ${edu.area} (${edu.startDate} - ${edu.endDate})\n`;
    if (edu.description) content += `  - ${edu.description}\n`;
  });
  content += `\n`;

  // Vector Friendliness Section
  content += `## Vector Friendliness\n`;
  content += `This section is optimized for RAG ingestion. It provides a dense summary of skills and experience.\n\n`;
  content += `**Identity**: ${basics.name}, ${basics.title}. Based in ${basics.location.city}, ${basics.location.country}.\n`;
  content += `**Core Competencies**: ${skills.flatMap(c => c.items.map(i => i.name)).join(', ')}.\n`;
  content += `**Experience Summary**: Worked at ${experience.map(e => e.company).join(', ')}.\n`;
  content += `**Project Highlights**: Built ${projects.map(p => p.title).join(', ')}.\n`;
  content += `**Education**: ${education.map(e => `${e.area} from ${e.institution}`).join(', ')}.\n\n`;

  // Contact
  content += `## Contact & Socials\n`;
  content += `- Email: ${basics.email}\n`;
  content += `- Location: ${basics.location.city}, ${basics.location.country}\n`;
  basics.socials.forEach(s => {
    content += `- ${s.network}: ${s.url}\n`;
  });

  fs.writeFileSync(OUTPUT_PATH, content);
  console.log(`Successfully generated ${OUTPUT_PATH}`);
}

generateLLMsText();
