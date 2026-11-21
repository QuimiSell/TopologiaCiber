/** Rutas públicas — deben coincidir con rewrites SPA en vercel.json */
export const ROUTES = {
  home: '/',
  professional: '/presentacion/profesional',
  quick: '/presentacion/rapida'
};

/** slideId en URL → índice de diapositiva (modo rápido) */
export const QUICK_SLIDE_IDS = ['overview', 'tb-01', 'tb-02', 'tb-03', 'tb-04', 'tb-05'];

export function quickPathForSlideIndex(index) {
  const id = QUICK_SLIDE_IDS[index] ?? 'overview';
  return id === 'overview' ? ROUTES.quick : `${ROUTES.quick}/${id}`;
}

export function slideIndexFromQuickParam(slideId) {
  if (!slideId || slideId === 'overview') return 0;
  const idx = QUICK_SLIDE_IDS.indexOf(slideId.toLowerCase());
  return idx >= 0 ? idx : 0;
}