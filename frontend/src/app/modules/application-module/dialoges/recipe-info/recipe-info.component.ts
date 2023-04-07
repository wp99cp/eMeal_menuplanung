import {Component, Inject, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';

import {Camp} from '../../classes/camp';
import {Recipe} from '../../classes/recipe';
import {SpecificMeal} from '../../classes/specific-meal';
import {SpecificRecipe} from '../../classes/specific-recipe';
import {SettingsService} from '../../services/settings.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-recipe-info',
  templateUrl: './recipe-info.component.html',
  styleUrls: ['./recipe-info.component.sass']
})
export class RecipeInfoComponent implements OnInit {

  public specificRecipe: SpecificRecipe;
  public camp: Camp;
  public specificMeal: SpecificMeal;
  public recipe: Recipe;
  public recipeForm: UntypedFormGroup;

  public calcRecipeParticipants = SettingsService.calcRecipeParticipants;
  public infoHasNotChanged = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp, specificMeal: SpecificMeal, recipe: Recipe, specificRecipe: SpecificRecipe },
    private formBuilder: UntypedFormBuilder) {

    this.camp = data.camp;
    this.recipe = data.recipe;

    this.specificMeal = data.specificMeal;
    this.specificRecipe = data.specificRecipe;

    this.recipeForm = this.formBuilder.group({
      description: this.recipe.description,
      name: this.recipe.name,
      participants: this.specificRecipe.participants,
      overrideParticipants: this.specificRecipe.overrideParticipants,
      vegi: this.specificRecipe.vegi
    });


    const originalValues = JSON.stringify({

      description: this.recipe.description,
      name: this.recipe.name,
      participants: this.specificRecipe.participants,
      overrideParticipants: this.specificRecipe.overrideParticipants,
      vegi: this.specificRecipe.vegi

    });

    // set up change listner
    this.recipeForm.valueChanges.subscribe(values => {
      this.infoHasNotChanged = JSON.stringify(values) === originalValues;
    });

  }


  ngOnInit() {

  }


  saveValueChanges() {

    // save data to firestore
    this.recipe.description = this.recipeForm.value.description;
    this.recipe.name = this.recipeForm.value.name;
    this.specificRecipe.overrideParticipants = this.recipeForm.get('overrideParticipants').value;
    this.specificRecipe.participants = this.recipeForm.get('participants').value;
    this.specificRecipe.vegi = this.recipeForm.get('vegi').value;

    return [this.recipe, this.specificRecipe];

  }

}
