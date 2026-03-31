export interface CreationItem {
  id: string;
  bookId: string;
  bookTitle: string;
  type: "shortbook" | "shortmovie" | "goods" | "music";
  goodsType?: "bookmark" | "sticker" | "illustration";
  title: string;
  thumbnail: string;
  content: string;
  createdAt: string;
  hearts: number;
  hearted?: boolean;
  musicPrompt?: string;
  musicStyle?: string;
  musicDuration?: number;
  audioUrl?: string;
  audioPreviewUrl?: string;
}

const STORAGE_KEY = "metabook_creations";

function load(): CreationItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function save(items: CreationItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getCreations(bookId?: string): CreationItem[] {
  const all = load();
  if (!bookId) return all;
  return all.filter((c) => c.bookId === bookId);
}

export function addCreation(item: Omit<CreationItem, "id" | "createdAt" | "hearts">) {
  const list = load();
  const newItem: CreationItem = {
    ...item,
    id: `creation_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    hearts: 0,
    hearted: false,
  };
  list.unshift(newItem);
  save(list);
  return newItem;
}

export function deleteCreation(id: string) {
  const list = load().filter((c) => c.id !== id);
  save(list);
}

export function toggleHeart(id: string): CreationItem | undefined {
  const list = load();
  const item = list.find((c) => c.id === id);
  if (!item) return undefined;
  item.hearted = !item.hearted;
  item.hearts += item.hearted ? 1 : -1;
  save(list);
  return item;
}
