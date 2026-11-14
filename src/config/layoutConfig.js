/** Layout thresholds aligned with Tailwind screens (see tailwind.config.js). */

export const SIDEBAR_BREAKPOINT_PX = 1280;

/** Persistent sidebar + open PDU panel (PC / large tablets with keyboard). */
export const MEDIA_SIDEBAR_LAYOUT = `(min-width: ${SIDEBAR_BREAKPOINT_PX}px)`;

/** Phone landscape: collapse chrome to preserve canvas height. */
export const MEDIA_COMPACT_LANDSCAPE =
  '(max-height: 430px) and (orientation: landscape)';