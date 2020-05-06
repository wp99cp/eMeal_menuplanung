import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SwissDateAdapter } from 'src/app/utils/format-datapicker';

import { SpecificMeal } from '../../_class/specific-meal';
import { Day } from '../../_class/day';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-meal-prepare',
  templateUrl: './meal-prepare.component.html',
  styleUrls: ['./meal-prepare.component.sass']
})
export class MealPrepareComponent {

  public prepareForm: FormGroup;
  public specificMeal: SpecificMeal;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: { specificMeal: SpecificMeal, days: Day[] },
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
   * Mahlzeiten können nur mind. ein Tag vorhher vorbereitet werden.
   * Ausserdem können sie nur vor dem Lager oder während dem Lager an einem
   * existierenden Tag vorbereitet werden.
   *
   * TODO: Vorbereiten löschen, falls der Tag an dem die Mahlzeit vorbereitet wird gelöscht wird,
   * dies führt dazu, dass die Zutaten nicht in der EInkaufsliste auftauchen... --> known bug
   *
   */
  public dateFilter = (d: Date | null): boolean => {

    const filter = this.data.days.filter(day => day.dateAsTypeDate.getTime() === d.getTime());
    return d.getTime() < this.data.days[0].dateAsTypeDate.getTime() ||
      (filter.length === 1 && d.getTime() < this.specificMeal.date.toDate().getTime());

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
