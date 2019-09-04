import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { Observable } from 'rxjs';

import { auth } from 'firebase/app';

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {

  private db: AngularFirestore;
  private afAuth: AngularFireAuth;

  private camps: Observable<any[]>;

  constructor(db: AngularFirestore, afAuth: AngularFireAuth) {

    this.db = db;
    this.afAuth = afAuth;

    this.loadCamps();

  }

  login() {
    this.afAuth.auth.signInWithRedirect(new auth.GoogleAuthProvider());
  }

  logout() {
    this.afAuth.auth.signOut();
  }

  loadCamps() {
    this.camps = this.db.collection('camps').valueChanges();
    console.log('camps loaded');
  }

}