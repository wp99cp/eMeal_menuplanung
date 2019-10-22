import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { Meal } from '../_class/meal';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirestoreMeal } from '../_interfaces/firestore-meal';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Camp } from '../_class/camp';
import { FirestoreSpecificMeal } from '../_interfaces/firestore-specific-meal-data';


@Component({
  selector: 'app-edit-meal',
  templateUrl: './edit-meal.component.html',
  styleUrls: ['./edit-meal.component.sass']
})
export class EditMealComponent implements OnInit {

  private meal: Observable<Meal>;
  private mealInfo: FormGroup;
  private camp: Camp;
  private campId: string;
  private dayNumber: string
  private mealId: string


  constructor(private route: ActivatedRoute, private db: AngularFirestore, private formBuilder: FormBuilder) { }

  ngOnInit() {


    // load camp from url
    this.route.url.subscribe(url => {
      // get mealId as last part of the url
      this.campId = url[url.length - 5].path;
      this.dayNumber = url[url.length - 3].path;
      this.mealId = url[url.length - 1].path;
      this.loadMeal();
    });

    this.meal.subscribe(meal => {
      this.mealInfo = this.formBuilder.group({
        title: meal.title
      })
    });



  }

  loadMeal(): void {

    // TODO: evtl. Zusammenfassbar mit den anderen Abfragen -> Auslagerung in ein Service...
    this.meal = Observable.create((observer: Observer<Meal>) => {

      this.db.doc(Meal.FIRESTORE_DB_PATH + this.mealId)
        .snapshotChanges().subscribe(
          (docRef) => observer.next(new Meal(docRef.payload.data() as FirestoreMeal, docRef.payload.id, this.db, this.campId)),
          (error) => observer.error(error)

        );

    });


  }

}
