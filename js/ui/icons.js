// js/ui/icons.js - Inline SVG icon set (stroke follows currentColor)

const svg = (inner, filled = false) =>
  `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="${filled ? 'none' : 'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  menu: svg('<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/>'),
  chevronDown: svg('<polyline points="6 9 12 15 18 9"/>'),
  chevronRight: svg('<polyline points="9 6 15 12 9 18"/>'),
  eye: svg('<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.5"/>'),
  swap: svg('<polyline points="7 4 3 8 7 12"/><line x1="3" y1="8" x2="16" y2="8"/><polyline points="17 12 21 16 17 20"/><line x1="8" y1="16" x2="21" y2="16"/>'),
  sparkles: svg('<path d="M12 3l1.6 4.2L18 9l-4.4 1.8L12 15l-1.6-4.2L6 9l4.4-1.8L12 3z"/><path d="M5.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z"/><path d="M18 15.5l.7 1.7 1.8.7-1.8.7-.7 1.7-.7-1.7-1.8-.7 1.8-.7.7-1.7z"/>', true),
  layers: svg('<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>'),
  textSize: svg('<text x="3" y="17" font-size="13" font-weight="700" fill="currentColor" stroke="none" font-family="inherit">Tt</text>'),
  sound: svg('<line x1="5" y1="10" x2="5" y2="14"/><line x1="9" y1="7" x2="9" y2="17"/><line x1="13" y1="4" x2="13" y2="20"/><line x1="17" y1="8" x2="17" y2="16"/><line x1="21" y1="11" x2="21" y2="13"/>'),
  palette: svg('<path d="M12 3a9 9 0 1 0 0 18c1.2 0 2-.9 2-2 0-.6-.2-1-.5-1.4-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3A4.7 4.7 0 0 0 21 9.7C20.4 5.9 16.6 3 12 3z"/><circle cx="7.5" cy="11" r="1" fill="currentColor" stroke="none"/><circle cx="10.5" cy="7.5" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.5" fill="currentColor"/>'),
  help: svg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.2A2.6 2.6 0 0 1 12 7.5c1.4 0 2.5 1 2.5 2.3 0 1.6-2.5 2-2.5 3.7"/><circle cx="12" cy="16.5" r="0.5" fill="currentColor"/>'),
  home: svg('<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'),
  calendar: svg('<rect x="4" y="5" width="16" height="16" rx="2"/><line x1="4" y1="10" x2="20" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>'),
  send: svg('<path d="M21 3L10 14"/><path d="M21 3l-7 18-4-7-7-4 18-7z"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/>'),
  users: svg('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c.7-3 2.9-4.5 5.5-4.5s4.8 1.5 5.5 4.5"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M16 14.6c2.2.2 3.9 1.6 4.5 4.4"/>'),
  numbers: svg('<text x="2" y="16.5" font-size="11" font-weight="700" fill="currentColor" stroke="none" font-family="inherit">123</text>'),
  utensils: svg('<path d="M7 3v7a2 2 0 0 0 2 2v9M9 3v5M5 3v5"/><path d="M17 3c-1.7 0-3 2-3 5 0 2.2 1 3.5 2 4v9"/>'),
  body: svg('<circle cx="12" cy="5" r="2.5"/><path d="M5 10h14M12 10v6M12 16l-3.5 5M12 16l3.5 5"/>'),
  leaf: svg('<path d="M5 19C5 9 12 4 20 4c0 10-5 15-12 15"/><path d="M5 19c3-4 7-7 11-9"/>'),
  music: svg('<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  book: svg('<path d="M4 5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 0-2 2V5z"/><line x1="8" y1="7" x2="16" y2="7"/>'),
  close: svg('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>'),
  table: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="12" y1="10" x2="12" y2="20"/>'),
};

// Keyword → icon mapping for lesson rows (matched against word_type text)
const LESSON_ICON_RULES = [
  [/day|week|month|date/i, 'calendar'],
  [/direction/i, 'send'],
  [/time/i, 'clock'],
  [/color/i, 'palette'],
  [/family|people|person(?!al)/i, 'users'],
  [/number|count/i, 'numbers'],
  [/food|drink|eat/i, 'utensils'],
  [/body/i, 'body'],
  [/house|home/i, 'home'],
  [/nature|environment|animal|plant/i, 'leaf'],
  [/music|audio|art/i, 'music'],
];

export function iconForLesson(label) {
  for (const [pattern, name] of LESSON_ICON_RULES) {
    if (pattern.test(label)) return ICONS[name];
  }
  return ICONS.book;
}
