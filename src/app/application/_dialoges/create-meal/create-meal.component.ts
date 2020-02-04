import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../_service/authentication.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { empty } from 'rxjs';
import { FirestoreMeal } from '../../_interfaces/firestoreDatatypes';
import { FirestoreObject } from '../../_class/firebaseObject';

/**
 * TODO: Hier können später direkt Rezepte ausgewählt werden.
 */
@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.sass']
})
export class CreateMealComponent implements OnInit {

  public newMealForm: FormGroup;

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {

    this.newMealForm = formBuilder.group({

      title: '',
      description: ''

    });

  }

  ngOnInit() {
  }

  public close(): Observable<any> {

    return empty();

  }

  public create(): Observable<FirestoreMeal> {

    return this.authService.getCurrentUser().pipe(map(user => {

      const meal = FirestoreObject.exportEmptyDocument(user.uid) as FirestoreMeal;
      meal.meal_name = this.newMealForm.value.title;
      meal.meal_description = this.newMealForm.value.description;
      meal.meal_keywords = [];
      return meal;

    }));



  }

}
