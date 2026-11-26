/** Variabel CSS untuk sebuah template (dipakai pratinjau penuh dan mini cover). */
export function themeStyle(theme) {
  const v = theme.vars;
  return {
    '--t-bg': v.bg,
    '--t-ink': v.ink,
    '--t-accent': v.accent,
    '--t-soft': v.soft,
    '--t-line': v.line,
    '--t-on': v.on,
    '--t-grad': v.grad,
    '--f-head': theme.fonts.head,
    '--f-body': theme.fonts.body,
    '--f-name': theme.fonts.name,
  };
}
