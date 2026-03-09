- Added JSDocs to exported functions in src/utils/seo.js, src/components/shared/themeMotion.js, src/components/shared/chatHistory.js, src/components/shared/ThemeProvider.jsx, src/components/shared/pyodideLoader.js
- Fixed broken localhost link in README.md
- Fixed broken mailto link in SECURITY.md

## 2026-03-03

- Audited documentation for broken links and formatting issues.
- Added missing JSDoc comments to `src/components/shared/ThemedCard.jsx` and `src/components/shared/ThemedSectionHeading.jsx`.

- Audited `src/utils/seo.js` for missing JSDoc documentation
- Added `@returns {Object}` type descriptions to all exported structured data schema functions in `src/utils/seo.js` for completeness

- Audited codebase for missing JSDocs on exported functions/components.
- Added missing JSDoc comments to `ThemedChip` component in `src/components/shared/ThemedChip.jsx`.
- Updated `docs/ARCHITECTURE.md` and `CONTRIBUTING.md` security report links
- Added missing JSDoc for `App` component
- Updated JSDoc `@example` blocks in `src/utils/security.js` to use `// => 'expected output'` format instead of `// Returns:` to prevent AST linter `no-console` warnings.
