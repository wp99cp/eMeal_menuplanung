import { Component, OnInit, Input } from '@angular/core';
import { Recipe } from '../../_class/recipe';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Ingredient } from '../../_interfaces/ingredient';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})
export class EditRecipeComponent implements OnInit {

  protected displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food', 'delete'];
  protected recipeForm: FormGroup;

  @Input() recipe: Recipe;

  private dataSource: MatTableDataSource<Ingredient>;


  constructor(private formBuilder: FormBuilder) { }

  ngOnInit() {

    // set form values
    this.recipeForm = this.createForm();
    this.dataSource = new MatTableDataSource<Ingredient>(this.recipe.ingredients);

  }

  private createForm(): FormGroup {

    return this.formBuilder.group({
      notes: this.recipe.notes,
      description: this.recipe.description,
      name: this.recipe.name
    });
  }

  delete(index: number) {

    this.dataSource.data.splice(index, 1);
    this.dataSource._updateChangeSubscription();
    this.recipeForm.markAsTouched();

  }

  add() {
    this.dataSource.data[this.dataSource.data.length] = {
      food: '',
      unit: '',
      measure: null
    };
    this.dataSource._updateChangeSubscription();
    this.recipeForm.markAsTouched();

    console.log(this.dataSource.data)
  }

  changeIngredient(value: string, index: number, element: string) {

    if (element == "calcMeasure") {
      this.recipe.ingredients[index]["measure"] = Number.parseInt(value) / 12;
    }
    else {
      this.recipe.ingredients[index][element] = value;
    }
    this.recipeForm.markAsTouched();

  }

  saveRecipe() {

    // save data to firestore
    this.recipe.notes = this.recipeForm.value.notes;
    this.recipe.description = this.recipeForm.value.description;
    this.recipe.name = this.recipeForm.value.name;

    this.recipe.pushToFirestoreDB();

    // reset: deactivate save button
    this.recipeForm.markAsUntouched();
  }

}
