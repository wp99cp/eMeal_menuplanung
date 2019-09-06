import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {


  constructor(public fireAuth: AngularFireAuth, private router: Router) { }

  public signIn() {

    this.fireAuth.authState.subscribe(user => {
      if (user == null)
        this.fireAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider);
    });

  }

  public signOut() {

    this.fireAuth.auth.signOut();

  }

}
