export interface FavoriteItem {
  bookId: string;
  chapterId?: string;
  imageId?: string;
  title: string;
  coverImage: string;
  addedAt: string;
}

const STORAGE_KEY = "metabook_favorites";

function load(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function save(items: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getFavorites(): FavoriteItem[] {
  return load();
}

export function addFavorite(item: FavoriteItem) {
  const list = load();
  if (list.some((f) => f.bookId === item.bookId)) return;
  list.unshift({ ...item, addedAt: new Date().toISOString() });
  save(list);
}

export function removeFavorite(bookId: string) {
  save(load().filter((f) => f.bookId !== bookId));
}

export function isFavorite(bookId: string): boolean {
  return load().some((f) => f.bookId === bookId);
}
