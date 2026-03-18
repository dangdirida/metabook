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

// 창작물 찜 시스템
export interface FavoriteCreation {
  id: string;
  bookId: string;
  type: "shortbook" | "shortmovie" | "goods";
  title: string;
  thumbnail: string;
  savedAt: string;
}

const CREATION_STORAGE_KEY = "metabook_favorite_creations";

function loadCreations(): FavoriteCreation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CREATION_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCreations(items: FavoriteCreation[]) {
  localStorage.setItem(CREATION_STORAGE_KEY, JSON.stringify(items));
}

export function getFavoriteCreations(): FavoriteCreation[] {
  return loadCreations();
}

export function addFavoriteCreation(item: Omit<FavoriteCreation, "savedAt">) {
  const list = loadCreations();
  if (list.some((f) => f.id === item.id)) return;
  list.unshift({ ...item, savedAt: new Date().toISOString() });
  saveCreations(list);
}

export function removeFavoriteCreation(id: string) {
  saveCreations(loadCreations().filter((f) => f.id !== id));
}

export function isFavoriteCreation(id: string): boolean {
  return loadCreations().some((f) => f.id === id);
}
