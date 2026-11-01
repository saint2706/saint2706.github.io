# P01 Route inventory

| Current route | Audience / purpose                 | Disposition                       | Proposed                          |
| ------------- | ---------------------------------- | --------------------------------- | --------------------------------- |
| `/`           | everyone; gateway and highlights   | redesign                          | `/`                               |
| `/projects`   | recruiters/peers; evidence of work | keep, add per-project pages later | `/projects/`                      |
| `/resume`     | recruiters; CV                     | redesign                          | `/about/` with `/resume` redirect |
| `/blog`       | readers; external posts            | keep, rename                      | `/writing/` with `/blog` redirect |
| `/contact`    | all                                | keep                              | `/contact/`                       |
| `/games`      | visitors; fun                      | move into lab                     | `/lab/games/`, redirect           |
| `/playground` | developers; code runner            | move into lab                     | `/lab/playground/`, redirect      |
| `/*`          | unknown paths                      | keep                              | 404 page                          |

Pages deep-link behavior: unknown paths return HTTP 404 and the repo `404.html` script redirects into the SPA; this was inspected in code only, not tested live. Prerender (ADR-001) removes this for known routes.
