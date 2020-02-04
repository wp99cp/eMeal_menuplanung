import { Component, OnInit, Inject } from '@angular/core';
import { SpecificMeal } from '../../_class/specific-meal';
import { MAT_DIALOG_DATA } from '@angular/material';
import { SwissDateAdapter } from 'src/app/utils/format-datapicker';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-meal-prepare',
  templateUrl: './meal-prepare.component.html',
  styleUrls: ['./meal-prepare.component.sass']
})
export class MealPrepareComponent implements OnInit {

  public prepareForm: FormGroup;
  public specificMeal: SpecificMeal;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { specificMeal: SpecificMeal },
    public swissDateAdapter: SwissDateAdapter,
    private formBuilder: FormBuilder) {

    this.specificMeal = data.specificMeal;

    if (data.specificMeal.prepareAsDate !== undefined) {

      this.prepareForm = this.formBuilder.group({
        hasPrepareDate: true,
        prepareDate: data.specificMeal.prepareAsDate
      });

    } else {

      this.prepareForm = this.formBuilder.group({
        hasPrepareDate: false,
        prepareDate: new Date()
      });

    }



  }

  public returnsSpecificMeal() {

    if (this.prepareForm.value.hasPrepareDate) {

      this.specificMeal.prepareAsDate = this.prepareForm.value.prepareDate;
      
    } else {

      this.specificMeal.prepareAsDate = null;

    }


    return this.specificMeal;

  }

  ngOnInit() { }

}
