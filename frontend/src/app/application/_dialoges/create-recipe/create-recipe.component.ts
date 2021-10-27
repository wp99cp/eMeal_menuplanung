import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../../_service/authentication.service';
import { Observable, empty } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirestoreRecipe } from '../../_interfaces/firestoreDatatypes';
import { FirestoreObject } from '../../_class/firebaseObject';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.sass']
})
export class CreateRecipeComponent implements OnInit {

  public newRecipeForm: FormGroup;

  constructor(
    private authService: AuthenticationService,
    formBuilder: FormBuilder,
    public router: Router,
    public dialogRef: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { recipeName: string }) {

    this.newRecipeForm = formBuilder.group({

      title: data.recipeName,
      description: '',
      notes: ''

    });

  }

  ngOnInit() {
  }

  public close(): Observable<any> {

    return empty();

  }

  public create(): Observable<FirestoreRecipe> {

    return this.authService.getCurrentUser().pipe(map(user => {

      const recipe = FirestoreObject.exportEmptyDocument(user.uid) as FirestoreRecipe;

      recipe.recipe_name = this.newRecipeForm.value.title;
      recipe.recipe_description = this.newRecipeForm.value.description;
      recipe.ingredients = [];
      recipe.recipe_notes = this.newRecipeForm.value.notes;
      recipe.used_in_meals = [];

      return recipe;
    }));


  }

}
