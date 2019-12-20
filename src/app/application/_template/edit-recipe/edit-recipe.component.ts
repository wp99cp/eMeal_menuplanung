import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Recipe } from '../../_class/recipe';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Ingredient } from '../../_interfaces/ingredient';
import { SpecificRecipe } from '../../_class/specific-recipe';
import { DatabaseService } from '../../_service/database.service';
import { SpecificMeal } from '../../_class/specific-meal';
import { Camp } from '../../_class/camp';

@Component({
  selector: 'app-edit-recipe',
  templateUrl: './edit-recipe.component.html',
  styleUrls: ['./edit-recipe.component.sass']
})

// TODO: überschreiben von MasterDocument (Recipe) mit Daten (vorallem bei den Zutaten),.
// die im specificrecipe gespeichert werden... Überschreibungen farbig markieren.
// toggle zwischen den Modi: dieses Rezept bearbeiten || Vorlage bearbeiten
//
export class EditRecipeComponent implements OnInit, OnDestroy {

  public displayedColumns: string[] = ['measure', 'calcMeasure', 'unit', 'food', 'delete'];
  public recipeForm: FormGroup;

  @Input() specificMeal: SpecificMeal;
  @Input() recipe: Recipe;
  @Input() specificRecipe: SpecificRecipe;
  @Input() camp: Camp;


  public dataSource: MatTableDataSource<Ingredient>;

  constructor(private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

  ngOnInit() {

    this.dataSource = new MatTableDataSource<Ingredient>(this.recipe.ingredients);

    this.recipeForm = this.formBuilder.group({
      notes: this.recipe.notes,
      description: this.recipe.description,
      name: this.recipe.name,
      participants: this.specificRecipe.participants,
      overrideParticipants: this.specificRecipe.overrideParticipants
    });


  }


  // save on destroy
  ngOnDestroy(): void {

    if (this.recipeForm.touched) {
      console.log('Autosave Recipe');
      this.saveRecipe();
    }

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
      this.recipe.ingredients[index].measure = Number.parseInt(value) / (this.specificRecipe.overrideParticipants ? this.specificRecipe.participants :
        (this.specificMeal.overrideParticipants ? this.specificMeal.participants : this.camp.participants));
    } else {
      this.recipe.ingredients[index][element] = value;
    }
    this.recipeForm.markAsTouched();

  }

  saveRecipe() {

    // save data to firestore
    this.recipe.notes = this.recipeForm.value.notes;
    this.recipe.description = this.recipeForm.value.description;
    this.recipe.name = this.recipeForm.value.name;
    this.specificRecipe.overrideParticipants = this.recipeForm.value.overrideParticipants;
    this.specificRecipe.participants = this.recipeForm.value.participants;

    this.databaseService.updateDocument(this.recipe.extractDataToJSON(), this.recipe.getDocPath());
    this.databaseService.updateDocument(this.specificRecipe.extractDataToJSON(), this.specificRecipe.getDocPath());

    // reset: deactivate save button
    this.recipeForm.markAsUntouched();

  }

}
