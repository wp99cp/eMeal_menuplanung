import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SwissDateAdapter } from 'src/app/utils/format-datapicker';

import { SpecificMeal } from '../../_class/specific-meal';

@Component({
  selector: 'app-meal-prepare',
  templateUrl: './meal-prepare.component.html',
  styleUrls: ['./meal-prepare.component.sass']
})
export class MealPrepareComponent {

  public prepareForm: FormGroup;
  public specificMeal: SpecificMeal;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { specificMeal: SpecificMeal },
    public swissDateAdapter: SwissDateAdapter,
    private formBuilder: FormBuilder) {

    this.specificMeal = data.specificMeal;

    if (data.specificMeal.prepareAsDate !== undefined) {

      this.prepareForm = this.formBuilder.group({
        hasPrepareDate: data.specificMeal.prepare,
        prepareDate: data.specificMeal.prepareAsDate
      });

    } else {

      this.prepareForm = this.formBuilder.group({
        hasPrepareDate: false,
        prepareDate: new Date()
      });

    }



  }

  /**
   * Returns the updatetd specificMeal
   */
  public returnsSpecificMeal() {

    // standardmässig wird eine Mahlzeit nicht vorbereitet
    this.specificMeal.prepare = false;

    if (this.prepareForm.value.hasPrepareDate) {

      this.specificMeal.prepareAsDate = this.prepareForm.value.prepareDate;
      this.specificMeal.prepare = true;

    }

    return this.specificMeal;

  }


}
