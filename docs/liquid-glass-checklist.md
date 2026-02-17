# Liquid Glass Migration Checklist & Static Neub Audit

_Last updated: 2026-02-14._

## 1) Route checklist (Liquid Glass readiness gate)

> Gate criteria per route:
> 1. **No neub utility usage in Liquid Glass-only shells unless explicitly intentional**
> 2. **Consistent glass surface hierarchy** (shell → section → control)
> 3. **Readable contrast + visible focus states** for interactive controls

| Route | Neub-in-Liquid Glass leakage | Glass hierarchy | Contrast / focus | Status | Notes |
|---|---|---|---|---|---|
| `/` | ❌ | ⚠️ | ⚠️ | In progress | `Hero` still renders unconditional `nb-*`, `border-nb`, `rounded-nb`, and `var(--nb-shadow)` decorations that appear while Liquid Glass is active. |
| `/projects` | ⚠️ | ✅ | ✅ | In progress | Most surfaces are theme-conditional; heading animation chip still carries `nb-stamp-in` in shared heading callsite. |
| `/resume` | ❌ | ⚠️ | ✅ | In progress | Mix of Liquid Glass + unconditional neub timeline/footer cards remains in Liquid Glass path. |
| `/blog` | ⚠️ | ✅ | ✅ | In progress | Search/filter shell is Liquid Glass-ready; heading and at least one card shadow remain tied to neub tokens. |
| `/contact` | ❌ | ⚠️ | ✅ | In progress | Liquid Glass form fields are good, but info blocks and badges still use unconditional neub classes/shadows. |
| `/games` | ⚠️ | ✅ | ✅ | In progress | Core game theme helpers are conditional; some controls keep baseline `rounded-nb` class before Liquid Glass overrides. |
| `/playground` | ⚠️ | ✅ | ✅ | In progress | Major surfaces are conditional; several controls/chips include neub defaults before Liquid Glass branch classes. |
| `*` (404) | ⚠️ | ✅ | ✅ | In progress | Mostly conditional, but includes unconditional neub text-shadow/decorative tokens in Liquid Glass mode. |

### Route exit criteria (definition of done)

A route is considered **Liquid Glass-complete** only when all of the following are true:

- [ ] No unconditional `nb-*`, `rounded-nb`, `border-nb`, or `var(--nb-shadow*)` usage in the rendered Liquid Glass path.
- [ ] Glass hierarchy follows one visual depth ladder (page shell > section cards > chips/buttons).
- [ ] Keyboard focus rings are visible against each Liquid Glass surface (default + `prefers-contrast: more`).

## 2) Static grep audit + classification

Audit command used:

```bash
rg -n "nb-|rounded-nb|border-nb|var\(--nb-shadow\)" src
```

### Classification rubric

- **Allowed in neub-only branch**: Token appears only in explicit neub branch or shared neub token definitions.
- **Must be theme-conditional**: Token is used by a component rendered in both themes and needs Liquid Glass-safe branching.
- **Must be removed/replaced**: Token is unconditional in Liquid Glass path and should be replaced with Liquid Glass utility/semantic surface token.

### Classified hit groups

| Classification | Files / hit groups | Why |
|---|---|---|
| Allowed in neub-only branch | `src/index.css` neub token definitions + `nb-*` utility classes; `src/components/shared/ThemedButton.jsx`; `src/components/shared/ThemedChip.jsx`; `src/components/shared/ThemedCard.jsx`; `src/components/shared/ThemedPrimitives.utils.js`; `src/components/games/gameThemeStyles.js`; most `themeClass(...)`/`isLiquid ? ... : ...` usages in Navbar/Games/Playground/NotFound | These are either canonical neub primitives or already gated through theme branching. |
| Must be theme-conditional | `src/components/pages/Projects.jsx` (`nb-stamp-in` heading chip); `src/components/pages/Blog.jsx` (`nb-stamp-in` + one nb shadow style); `src/components/pages/Resume.jsx` mixed cards/chips; `src/components/pages/Contact.jsx` mixed badges/cards; `src/components/pages/Games.jsx` + `src/components/pages/Playground.jsx` baseline `rounded-nb` class on tab/button controls; `src/components/shared/TerminalMode.jsx`; `src/components/shared/ChatInterface.jsx`; `src/components/shared/RoastInterface.jsx`; `src/components/shared/Modal.jsx`; `src/components/shared/CommandPalette.jsx`; `src/components/shared/Chatbot.jsx`; `src/components/shared/MarqueeTicker.jsx`; `src/components/shared/SkeletonLoader.jsx` | Shared components can render in both themes; any neub utility there must be explicitly gated to avoid Liquid Glass leakage. |
| Must be removed/replaced | `src/components/home/Hero.jsx` unconditional decorative neub stickers/shadows in Liquid Glass experience; `src/components/layout/Footer.jsx` secret badge (`rounded-nb` + hard neub shadow) shown regardless of theme; `src/components/pages/NotFound.jsx` unconditional `textShadow: 'var(--nb-shadow)'` | These are active in Liquid Glass UI without explicit “intentional neub accent” annotation and break Liquid Glass-only shell consistency. |

## 3) Page/component Liquid Glass status map and debt

| Route | Primary page component | Liquid Glass variant status | Remaining debt |
|---|---|---|---|
| `/` | `src/components/home/Hero.jsx` | **Partial** | Remove or feature-flag neub stickers/shapes for Liquid Glass; replace with Liquid Glass chips/glow tokens where needed. |
| `/projects` | `src/components/pages/Projects.jsx` | **Near-ready** | Convert heading `nb-stamp-in` to Liquid Glass-safe animation variant. |
| `/resume` | `src/components/pages/Resume.jsx` | **Partial** | Convert unconditional neub cards/badges to themeClass/Themed primitives. |
| `/blog` | `src/components/pages/Blog.jsx` | **Near-ready** | Remove remaining unconditional neub chip/shadow usage. |
| `/contact` | `src/components/pages/Contact.jsx` | **Partial** | Migrate highlighted info blocks, status widgets, and icon blocks to Liquid Glass classes/tokens. |
| `/games` | `src/components/pages/Games.jsx` + `src/components/games/*` | **Near-ready** | Clean up residual baseline `rounded-nb` and verify focus on Liquid Glass tabs/game controls. |
| `/playground` | `src/components/pages/Playground.jsx` | **Near-ready** | Clean up residual baseline `rounded-nb` and ensure Liquid Glass-only control classes are dominant. |
| `*` | `src/components/pages/NotFound.jsx` | **Near-ready** | Replace unconditional neub text-shadow and any Liquid Glass-leaking decorative neub utilities. |

### Cross-route shared component debt

- `src/components/layout/Navbar.jsx`: mostly compliant; verify brand pill and any non-conditional `rounded-nb` do not leak into Liquid Glass.
- `src/components/layout/Footer.jsx`: one unconditional neub secret badge still leaks into Liquid Glass.
- `src/components/shared/TerminalMode.jsx`: currently hard-neub window skin; add Liquid Glass variant or isolate as intentionally neub.
- `src/components/shared/ChatInterface.jsx` + `RoastInterface.jsx`: several controls still neub by default and should be gated.

## 4) Default theme policy (keep neub fallback)

**Policy remains unchanged:** `neubrutalism` stays the default/fallback theme until all route checklist rows are complete.

Current code already enforces this:

- Theme context default is `neubrutalism`.
- Theme provider falls back to `neubrutalism` for missing/invalid persisted values.

Do **not** switch default to Liquid Glass until this checklist is fully checked off.

## 5) Deprecated history

- The previous theme key was `aura`.
- `aura` is deprecated and fully replaced by `liquid`.
