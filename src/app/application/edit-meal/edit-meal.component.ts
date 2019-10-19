import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { Meal } from '../_class/meal';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { FormGroup, FormBuilder } from '@angular/forms';


@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit {

  private meal: Observable<Meal>;
  private mealInfo: FormGroup;


  constructor(private route: ActivatedRoute, private db: AngularFirestore, private formBuilder: FormBuilder) { }

  ngOnInit() {

    // load camp from url
    this.route.url.subscribe(url =>
      // get mealId as last part of the url
      this.loadMeal(url[url.length - 1].path)
    );

    this.meal.subscribe(meal => {
      this.mealInfo = this.formBuilder.group({
        title: meal.title,
        participants: 12,
        participantsOverwrite: true
      })
    });



  }

  loadMeal(mealId: string): void {

    // TODO: evtl. Zusammenfassbar mit den anderen Abfragen -> Auslagerung in ein Service...
    this.meal = Observable.create((observer: Observer<Meal>) => {
      this.db.doc(Meal.FIRESTORE_DB_PATH + mealId)
        .snapshotChanges().subscribe(
          (docRef) => observer.next(new Meal(docRef.payload.data() as FirestoreMeal, docRef.payload.id, this.db)),
          (error) => observer.error(error)
        );
    });


  }

}
