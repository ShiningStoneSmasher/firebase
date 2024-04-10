import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface'
import { Firestore, collectionData, collection, doc, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];

  items$;
  items;

  unsubList;
  unsubSingle;

  firestore: Firestore = inject(Firestore);

  

  constructor() {

    this.unsubList = onSnapshot(this.getNotesRef(), (list) => {
      list.forEach(element => {
        console.log(element);
      });
    });

    this.unsubSingle = onSnapshot(this.getSingleDocRef("notes", "21sasd561dd4sdf"), (element) =>{
    });


    this.items$ = collectionData(this.getNotesRef());
    this.items = this.items$.subscribe((list) => {
      list.forEach(element => {
        console.log(element);
      });
    });
    this.items.unsubscribe();
  }


  ngOnDestroy(){
    this.unsubSingle();
    this.unsubList();
  };


    //     const itemCollection = collection(this.firestore, 'items');

    getNotesRef(){
      return collection(this.firestore, 'notes');
    }
  
  
    getTrashRef(){
      return collection(this.firestore, 'trash');
    }

    getSingleDocRef(colId: string, docId: string){
      return doc(collection(this.firestore, colId), docId);
    }

}
