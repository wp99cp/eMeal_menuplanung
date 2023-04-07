import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Recipe} from '../../classes/recipe';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {DatabaseService} from '../../services/database.service';
import {HelpService} from '../../services/help.service';

@Component({
  selector: 'app-single-recipe-info',
  templateUrl: './single-recipe-info.component.html',
  styleUrls: ['./single-recipe-info.component.sass']
})
export class SingleRecipeInfoComponent {

  public recipeInfo: UntypedFormGroup;

  public valueHasChanged = false;

  public hasAccess = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private recipe: Recipe,
    private formBuilder: UntypedFormBuilder,
    db: DatabaseService,
    public helpService: HelpService) {

    this.recipeInfo = this.formBuilder.group({

      title: this.recipe.name,
      description: this.recipe.description

    });
    this.recipeInfo.disable();


    db.canWrite(recipe).then(access => {
      this.hasAccess = access;

      if (access) {
        this.recipeInfo.enable();
      }

    });


    const originalValues = JSON.stringify({
      title: this.recipe.name,
      description: this.recipe.description
    });


    // set up change listner
    this.recipeInfo.valueChanges.subscribe(values => {
      this.valueHasChanged = JSON.stringify(values) === originalValues;
    });

  }


  /**
   * Saves the values in the recipe object
   *
   */
  saveValueChanges() {

    this.recipe.description = this.recipeInfo.value.description;
    this.recipe.name = this.recipeInfo.value.title;

    return this.recipe;
  }


}
