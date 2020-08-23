import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Recipe} from '../../_class/recipe';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DatabaseService} from "../../_service/database.service";

@Component({
  selector: 'app-single-recipe-info',
  templateUrl: './single-recipe-info.component.html',
  styleUrls: ['./single-recipe-info.component.sass']
})
export class SingleRecipeInfoComponent {

  public recipeInfo: FormGroup;

  public hasAccess = false;

  constructor(@Inject(MAT_DIALOG_DATA) private recipe: Recipe, private formBuilder: FormBuilder, db: DatabaseService) {

    this.recipeInfo = this.formBuilder.group({

      title: {value: this.recipe.name, disabled: !this.hasAccess},
      description: {value: this.recipe.description, disabled: !this.hasAccess}

    });

    db.canWrite(recipe).then(access => {
      this.hasAccess = access;
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
