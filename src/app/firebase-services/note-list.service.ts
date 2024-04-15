import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import {
  Firestore,
  collectionData,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  limit,
  orderBy,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NoteListService {
  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];

  unsubTrash;
  unsubNotes;
  unsubMarkedNotes;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubTrash = this.subTrashList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    this.unsubNotes = this.subNotesList();
  }

  async deleteNote(colId: 'notes' | 'trash', docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId))
      .catch((err) => {
        console.log(err);
      })
      .then();
  }

  async updateNote(note: Note) {
    if (note.id) {
      const docRef = this.getSingleDocRef(this.getColIdfromNote(note), note.id);
      try {
        await updateDoc(docRef, this.getCleanJson(note));
        console.log('Document updated successfully');
      } catch (err) {
        console.error('Error updating document:', err);
      }
    }
  }

  getCleanJson(note: Note) {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdfromNote(note: Note) {
    if (note.type == 'note') {
      return 'notes';
    } else {
      return 'trash';
    }
  }

  async addNote(item: Note, colId: 'notes' | 'trash') {
    if (colId == 'notes') {
      await addDoc(this.getNotesRef(), item)
        .catch((err) => {
          console.error(err);
        })
        .then((docRef) => {
          console.log('Document written with ID: ', docRef?.id);
        });
    } else {
      await addDoc(this.getTrashRef(), item)
        .catch((err) => {
          console.error(err);
        })
        .then((docRef) => {
          console.log('Document written with ID: ', docRef?.id);
        });
    }
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach((element) => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subNotesList() {

    let ref = collection(this.firestore, "notes/4AoTwx9qTuHMgF508FxP/extraNotes");
    const q = query(ref, limit(100));

    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach((element) => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });

      list.docChanges().forEach((change) => {
        if (change.type === 'added') {
          console.log('New note: ', change.doc.data());
        }
        if (change.type === 'modified') {
          console.log('Modified note: ', change.doc.data());
        }
        if (change.type === 'removed') {
          console.log('Removed note: ', change.doc.data());
        }
      });
    });
  }

  subMarkedNotesList() {
    const q = query(
      this.getNotesRef(),
      where('marked', '==', true),
      limit(100)
    );

    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach((element) => {
        this.normalMarkedNotes.push(
          this.setNoteObject(element.data(), element.id)
        );
      });
    });
  }

  ngOnDestroy() {
    this.unsubTrash();
    this.unsubNotes();
    this.unsubMarkedNotes();
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id || '',
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
