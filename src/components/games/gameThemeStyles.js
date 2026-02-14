const join = (...parts) => parts.filter(Boolean).join(' ');

export const getGameThemeStyles = isAura => {
  const panel = isAura
    ? 'aura-glass border border-[color:var(--border-soft)] rounded-2xl'
    : 'border-[3px] border-[color:var(--color-border)]';

  return {
    scoreboard: join('flex p-4', isAura ? 'gap-5' : 'gap-4 bg-secondary', panel),
    statBlock: 'px-3 md:px-4',
    separator: isAura ? 'w-px bg-[color:var(--border-soft)]' : 'w-[3px] bg-[color:var(--color-border)]',
    boardShell: join(isAura ? 'aura-glass rounded-2xl' : 'bg-card', panel),
    boardPadding: isAura ? 'p-3' : 'p-4',
    overlay: join(
      'absolute inset-0 flex flex-col items-center justify-center gap-4',
      isAura
        ? 'aura-glass border border-[color:var(--border-soft)] rounded-2xl backdrop-blur-md bg-primary/75'
        : 'bg-primary/90 border-[3px] border-[color:var(--color-border)]'
    ),
    banner: join(
      'font-heading font-bold px-4 py-2',
      isAura
        ? 'rounded-xl border border-[color:var(--border-soft)] backdrop-blur-sm'
        : 'border-[3px] border-[color:var(--color-border)]'
    ),
    statusBanner: join(
      'px-4 py-2 font-heading font-bold',
      isAura
        ? 'aura-glass border border-[color:var(--border-soft)] rounded-xl'
        : 'bg-secondary border-[3px] border-[color:var(--color-border)]'
    ),
    buttonPrimary: join(
      'px-6 py-3 font-heading font-bold flex items-center gap-2 cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none',
      isAura
        ? 'bg-accent/90 text-white border border-[color:var(--border-soft)] rounded-xl hover:brightness-110'
        : 'bg-accent text-white border-[3px] border-[color:var(--color-border)] hover:-translate-y-0.5'
    ),
    buttonSecondary: join(
      'px-6 py-2 font-heading font-bold flex items-center gap-2 cursor-pointer transition-transform motion-reduce:transform-none motion-reduce:transition-none',
      isAura
        ? 'aura-glass border border-[color:var(--border-soft)] text-[color:var(--color-text-primary)] rounded-xl hover:brightness-110'
        : 'bg-fun-yellow text-black border-[3px] border-[color:var(--color-border)] hover:-translate-y-0.5'
    ),
    tileBase: join(
      'font-heading font-bold select-none transition-all motion-reduce:transition-none',
      isAura
        ? 'border border-[color:var(--border-soft)] rounded-xl'
        : 'border-[3px] border-[color:var(--color-border)] rounded-nb'
    ),
    tileIdle: isAura ? 'bg-[color:var(--surface-muted)]/80' : 'bg-card',
    tileActive: isAura ? 'bg-accent/80 text-white' : 'bg-accent text-white -translate-x-0.5 -translate-y-0.5',
    tileWin: isAura ? 'bg-fun-yellow/40 border-fun-yellow/70' : 'bg-fun-yellow',
    style: {
      raised: isAura ? undefined : { boxShadow: '2px 2px 0 var(--color-border)' },
      board: isAura ? undefined : { boxShadow: 'var(--nb-shadow)' },
      tile: isAura ? undefined : { boxShadow: 'var(--nb-shadow)' },
      tileActive: isAura ? undefined : { boxShadow: 'var(--nb-shadow-hover)' },
    },
  };
};
