# Sentinel Security Log 🛡️

## 2024-05-22: Dependency Update - Minimatch

### Vulnerability

- **Package**: `minimatch`
- **Severity**: High
- **Type**: ReDoS (Regular Expression Denial of Service)
- **Advisories**:
  - GHSA-7r86-cg39-jmmj
  - GHSA-23c5-xmqv-rm74

### Fix

- Updated `minimatch` in `pnpm.overrides` to `>=10.2.3`.
- Verified with `pnpm audit` and `npm run test:security-full`.

### Verification

- `npm run test:security-full`: Passed
- `pnpm lint`: Passed
- `pnpm test:run`: Passed
