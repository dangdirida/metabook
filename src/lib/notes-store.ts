export interface Note {
  id: string;
  bookId: string;
  bookTitle: string;
  chapterTitle: string;
  text: string;
  memo: string;
  createdAt: string;
}

export function getNotes(): Note[] {
  try { return JSON.parse(localStorage.getItem("metabook_notes") || "[]"); }
  catch { return []; }
}

export function addNote(note: Omit<Note, "id" | "createdAt">): Note {
  const newNote: Note = { ...note, id: Date.now().toString(), createdAt: new Date().toISOString() };
  const notes = getNotes();
  notes.unshift(newNote);
  localStorage.setItem("metabook_notes", JSON.stringify(notes));
  return newNote;
}

export function deleteNote(id: string) {
  const notes = getNotes().filter((n) => n.id !== id);
  localStorage.setItem("metabook_notes", JSON.stringify(notes));
}
