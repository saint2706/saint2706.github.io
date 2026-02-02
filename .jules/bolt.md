# Bolt

## 2025-02-18 - Grid-Aware Eager Loading

**Learning:** When optimizing image loading for a grid layout, the number of eager-loaded images must match the number of columns in the first row (or the viewport visibility). Simply guessing "2" or "3" without verifying the layout can lead to "above the fold" images being lazy-loaded or "below the fold" images being eager-loaded.
**Action:** Always verify the visual grid layout (e.g., via `verify_projects.py` screenshots or CSS analysis) to set the correct `idx < N` threshold for eager loading.
