import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../../_service/authentication.service';

@Component({
  selector: 'app-meal-list-page',
  templateUrl: './meal-list-page.component.html',
  styleUrls: ['./meal-list-page.component.sass']
})
export class MealListPageComponent implements OnInit {

  public meals: Observable<any[]>;
  private user: firebase.User;

  /**
   * Speichert den aktuellen Benutzer ab und startet anschliessend die campListPage() Funktion.
   */
  constructor(private auth: AuthenticationService, private db: AngularFirestore) {
    this.auth.fireAuth.authState.subscribe(user => {
      if (user) {
        this.user = user;
        this.mealListPage();
      }
    });
  }


  ngOnInit() {
  }


  mealListPage() {

    this.meals = this.db.collection('meals', ref => ref.where('access.owner', 'array-contains', this.user.uid)).valueChanges();


  }
}
