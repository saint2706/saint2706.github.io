# Bolt Optimization Log

## Optimizations

### Frontend

- **Hero Component Memoization**: Wrapped the `Hero` component (`src/components/home/Hero.jsx`) in `React.memo` to prevent unnecessary re-renders when parent states change, especially given its position as the main landing page element and its relatively large UI tree. This is an initial defensive optimization to ensure the landing page remains snappy.
