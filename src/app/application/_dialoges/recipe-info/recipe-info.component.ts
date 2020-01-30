import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Camp } from '../../_class/camp';
import { Meal } from '../../_class/meal';
import { SpecificMeal } from '../../_class/specific-meal';
import { SpecificRecipe } from '../../_class/specific-recipe';
import { Recipe } from '../../_class/recipe';

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
  public recipeForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp, specificMeal: SpecificMeal, recipe: Recipe, specificRecipe: SpecificRecipe },
    private formBuilder: FormBuilder) {

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

  }


  ngOnInit() {

  }

  saveValueChanges() {

    // save data to firestore
    this.recipe.description = this.recipeForm.value.description;
    this.recipe.name = this.recipeForm.value.name;
    this.specificRecipe.overrideParticipants = this.recipeForm.value.overrideParticipants;
    this.specificRecipe.participants = this.recipeForm.value.participants;
    this.specificRecipe.vegi = this.recipeForm.value.vegi;

    return [this.recipe, this.specificRecipe];

  }

}
