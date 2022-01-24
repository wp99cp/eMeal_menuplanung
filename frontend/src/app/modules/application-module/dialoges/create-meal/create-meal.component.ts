import { Component, OnInit, Inject } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { empty } from 'rxjs';
import { FirestoreMeal } from '../../interfaces/firestoreDatatypes';
import { FirestoreObject } from '../../classes/firebaseObject';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.sass']
})
export class CreateMealComponent implements OnInit {

  public newMealForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    formBuilder: FormBuilder,
    public router: Router,
    public dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { mealName: string }) {

    this.newMealForm = formBuilder.group({

      title: data.mealName,
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
