# Roadmap and phase authorization

P00 is pre-authorized for audit/preparation only. Every later phase needs explicit user approval. One phase at a time; no auto-progression.

| Phase | Purpose                                                                                                | Gate                                                                    |
| ----- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| P00   | Comprehensive repository/content/asset/engineering/security/accessibility/performance/deployment audit | Dossier, evidence and recommendation delivered; user reviews            |
| P01   | Architecture, content, information architecture and governance decisions                               | Material ADRs approved; branch/release safeguards addressed             |
| P02   | Design research and Figma concepts/system                                                              | Visual concept and section approvals                                    |
| P03   | Approved technical and visual foundations                                                              | Build/tests/quality gates pass; old production site unchanged           |
| P04   | Professional experience and case studies                                                               | Facts approved; sections complete and reviewed                          |
| P05   | Personal space and curated collections                                                                 | Only substantive approved collections launch                            |
| P06   | Curated laboratory and justified immersive experiences                                                 | Security, performance and accessible equivalents pass                   |
| P07   | Cross-browser, accessibility, performance, security, SEO, creative review and release                  | All approved acceptance criteria pass with deployment/rollback evidence |

Dependency order: P00 → P01 → P02 → P03 → P04/P05 → P06 → P07. Follow task-level dependencies in JSON.

Branch convention: one feature branch per phase (`phase/00-repository-audit`, etc.); commit per independently verified task; push phase branch; phase PR after gates; never commit/push to default.

Production: keep current live site unchanged while branches are prepared. The captured deploy workflow may deploy after successful CI on default-branch push. Merge only when release is explicitly included in phase authorization. `workflow_dispatch` is production-capable and not a preview feature. Preserve a known-good deployment.

Design approvals occur progressively by section/component. Unapproved designs remain provisional. Minor safe within-vision changes may be autonomous; material scope/architecture/security/release changes require impact assessment and approval.
