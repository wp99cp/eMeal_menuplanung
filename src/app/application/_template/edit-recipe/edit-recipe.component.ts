import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Recipe } from '../../_class/recipe';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Ingredient } from '../../_interfaces/ingredient';
import { SpecificRecipe } from '../../_class/specific-recipe';
import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})
export class EditRecipeComponent implements OnInit {

  public displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food', 'delete'];
  public recipeForm: FormGroup;

  @Input() recipe: Recipe;
  @Input() specificRecipe: SpecificRecipe;

  public dataSource: MatTableDataSource<Ingredient>;

  constructor(private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

  ngOnInit() {

    this.recipeForm = this.formBuilder.group({
      notes: this.recipe.notes,
      description: this.recipe.description,
      name: this.recipe.name,
      participants: this.specificRecipe.participants

    });

    this.dataSource = new MatTableDataSource<Ingredient>(this.recipe.ingredients);

  }

  changePartcipations() {

    this.specificRecipe.participants = this.recipeForm.value.participants;

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

  }

  changeIngredient(value: string, index: number, element: string) {

    if (element === 'calcMeasure') {
      this.recipe.ingredients[index]['measure'] = Number.parseInt(value) / this.specificRecipe.participants;
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

    this.databaseService.updateDocument(this.recipe.extractDataToJSON(), this.recipe.getDocPath());
    this.databaseService.updateDocument(this.specificRecipe.extractDataToJSON(), this.specificRecipe.getDocPath());

    // reset: deactivate save button
    this.recipeForm.markAsUntouched();

  }

}
