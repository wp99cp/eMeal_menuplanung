import { Component, OnInit, Input } from '@angular/core';
import { Recipe } from '../../_class/recipe';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})
export class EditRecipeComponent implements OnInit {

  protected displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food'];
  protected recipeForm: FormGroup;

  @Input() recipe: Recipe;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {

    // set form values
    this.recipeForm = this.createForm();

  }

  private createForm(): FormGroup {

    return this.formBuilder.group({
      notes: this.recipe.notes,
      description: this.recipe.description,
      name: this.recipe.name
    });
  }

  saveRecipe() {

    // save data to firestore
    this.recipe.notes = this.recipeForm.value.notes;
    this.recipe.description = this.recipeForm.value.description;
    this.recipe.name = this.recipeForm.value.name;

    this.recipe.pushToFirestoreDB();

    // reset: deactivate save button
    this.recipeForm = this.createForm();
  }

}
