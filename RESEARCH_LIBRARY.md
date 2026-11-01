# Research and references

Checked 31 October 2026. Recheck version-sensitive information before implementation.

## Claude Code

- Skills: https://code.claude.com/docs/en/skills
- Subagents: https://code.claude.com/docs/en/sub-agents
- Hooks: https://code.claude.com/docs/en/hooks-guide
- Plugins: https://code.claude.com/docs/en/plugins
- Security: https://code.claude.com/docs/en/security
- Releases: https://github.com/anthropics/claude-code/releases

Latest stable shown in the release feed at the research snapshot: v2.1.316. This is dated information; run `claude --version` and refresh official docs before use.

## Figma

- MCP intro: https://developers.figma.com/docs/figma-mcp-server/
- Figma/Claude Code setup: https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server
- MCP vs agent: https://developers.figma.com/docs/figma-mcp-server/mcp-vs-agent/

Figma MCP gives design context and write tools; the implementation agent remains responsible for responsive behavior, quality and design-system adherence.

## Accessibility/browser

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Playwright snapshots: https://playwright.dev/docs/test-snapshots
- axe-core: https://github.com/dequelabs/axe-core

Visual snapshot output varies across operating systems, browsers and rendering environments. Keep screenshot baselines in a consistent CI environment. Automation cannot establish full WCAG conformance.

## GitHub Pages/security

- Pages publishing: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- Actions security: https://docs.github.com/en/actions/how-tos/secure-your-work
- Rulesets: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets

For each later research record include source/publisher, version, published date, access date, authority, concise findings, counter-evidence, relevance, related ADR/task and freshness status.
