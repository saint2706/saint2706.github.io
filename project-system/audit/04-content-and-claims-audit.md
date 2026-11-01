# 04 Content and Claims Audit

Status key: V verified in repo, U unsupported, C needs user confirmation, S stale.

| Claim                                                                            | Source     | Status                  | Note                                                                    |
| -------------------------------------------------------------------------------- | ---------- | ----------------------- | ----------------------------------------------------------------------- |
| Title "Data Storyteller & Analytics Strategist"                                  | resume.js  | C                       | brand choice                                                            |
| PGDM Big Data Analytics, GIM, Jun 2025 - Jul 2027                                | resume.js  | C                       | no external proof in repo                                               |
| B.Tech CS, VIT, 2020-2024                                                        | resume.js  | C                       |                                                                         |
| Experience incl. TheSmartBridge (Data Intern, May 2023)                          | resume.js  | C                       | no letters or links                                                     |
| Skill percentages (Python 95, Tableau 90, AWS 85 ...)                            | resume.js  | **U**                   | arbitrary numbers; some flagged `verified: true` with no evidence field |
| Certifications (AWS CCP, IBM, freeCodeCamp, Coursera, Udemy)                     | resume.js  | C                       | add credential URLs/IDs                                                 |
| 8 projects with GitHub links                                                     | resume.js  | V links, C descriptions | repos not fetched in this audit                                         |
| 12 blog posts (Medium, Dev.to)                                                   | blogs.json | V (script-synced)       | cover images are tracking pixels                                        |
| Languages incl. Marwari, French "Professional Working"                           | resume.js  | C                       |                                                                         |
| "Requires JavaScript" shell message                                              | index.html | S                       | conflicts with progressive-enhancement goal                             |
| README: Node `[20,22]`, `.jules/`, `cd rishabh-portfolio`, `VITE_GEMINI_API_KEY` | README.md  | **S**                   | CI uses Node 24/26; paths wrong; proxy now preferred                    |

Live verification of the 8 project repositories was not performed; pending for P01/P02.
