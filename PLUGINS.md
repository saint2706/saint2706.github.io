# Skills, plugins and specialist toolkit

Research snapshot: 31 October 2026. Verify the current marketplace identifier, revision, source, license, permissions and setup steps before installation.

## Already installed

- Impeccable — retain; inspect installed version and overlap.
- Anti-Slop — retain; inspect version and overlap.
- Unslop — explicitly excluded; never recommend/install.

## Figma official plugin — intended for P02, not P00

Figma setup docs recommend:

```bash
claude plugin install figma@claude-plugins-official
```

Authenticate with the user's Figma account. Review file/write permissions, plan/seat limits and potential cost. It can read structured design context and write to Figma; user authentication and approval required.
Docs: https://help.figma.com/hc/en-us/articles/39888612464151-Claude-Code-and-Figma-Set-up-the-MCP-server and https://developers.figma.com/docs/figma-mcp-server/

## Anthropic frontend-design plugin — optional candidate

Official upstream source: https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design. It can complement the artistic/anti-generic design goal. Inspect current source/marketplace identifier and overlap with Impeccable/Anti-Slop before installation. Do not invent install commands.

## Local skills included

Audit repository; execute approved task; verify phase; design review; accessibility review; research evidence. These are repository-local workflows, not marketplace packages.

## Testing/accessibility

Captured repo contains `playwright` for Lighthouse but did not list `@playwright/test`. Assess official Playwright Test runner only after architecture approval. Consider axe-core/`@axe-core/playwright`; manual WCAG review remains mandatory.
Refs: https://playwright.dev/docs/test-snapshots, https://github.com/dequelabs/axe-core, https://www.w3.org/TR/WCAG22/

## Visualization

No visualization plugin by default. An Atlassian Plotly skill exists (https://github.com/atlassian-labs/data-visualization-skill); use only if Plotly-based work justifies it, not for generic React UI.

## Review-before-install policy

Inspect upstream source/version/license/maintenance, tools/hooks/MCP access, dependencies, overlap, credential/network access, context footprint, costs and uninstall path. Do not bulk-install skills. Plugin execution has user privileges. No plugin/MCP is needed for P00.
