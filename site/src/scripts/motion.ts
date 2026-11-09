// Scroll behaviour that respects the site motion toggle (Base.astro sets html[data-motion]; off by default
// and for reduced-motion users), since an explicit `behavior: 'smooth'` overrides CSS scroll-behavior.
export const scrollBehavior = (): ScrollBehavior =>
  document.documentElement.dataset.motion === 'on' ? 'smooth' : 'auto';
