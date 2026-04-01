export interface Highlight {
  id: string;
  bookId: string;
  chapterNumber: number;
  text: string;
  color: "yellow" | "green" | "pink" | "blue";
  createdAt: string;
}

const KEY = "metabook_highlights";

export function getHighlights(bookId: string, chapterNumber?: number): Highlight[] {
  try {
    const all: Highlight[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    return all.filter((h) => h.bookId === bookId && (chapterNumber === undefined || h.chapterNumber === chapterNumber));
  } catch { return []; }
}

export function addHighlight(h: Omit<Highlight, "id" | "createdAt">): Highlight {
  try {
    const all: Highlight[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const newH: Highlight = { ...h, id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() };
    all.push(newH);
    localStorage.setItem(KEY, JSON.stringify(all));
    return newH;
  } catch { return { ...h, id: Date.now().toString(), createdAt: new Date().toISOString() }; }
}

export function removeHighlight(id: string): void {
  try {
    const all: Highlight[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    localStorage.setItem(KEY, JSON.stringify(all.filter((h) => h.id !== id)));
  } catch { /* */ }
}
