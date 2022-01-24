import {Component, Inject} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from '@angular/forms';

import {SpecificMeal} from '../../classes/specific-meal';
import {Day} from '../../classes/day';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HelpService} from "../../services/help.service";

@Component({
  selector: 'app-meal-prepare',
  templateUrl: './meal-prepare.component.html',
  styleUrls: ['./meal-prepare.component.sass']
})
export class MealPrepareComponent {

  public prepareForm: FormGroup;
  public dataHasNotChanged = true;
  public readonly dayBeforeDate: Date | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: { specificMeal: SpecificMeal, days: Day[] },
    private formBuilder: FormBuilder,
    public helpService: HelpService) {

    // Select the day before the current day. Only days in the week view are considered
    this.dayBeforeDate = this.data.days.filter(day =>
      day.dateAsTypeDate.getTime() < this.data.specificMeal.date.toDate().getTime()).slice(-1)[0]?.getTimestamp().toDate()


    const hasPrepareDate = data.specificMeal.prepare;
    const defaultPrepareDate = this.dayBeforeDate !== undefined ? this.dayBeforeDate : new Date()
    const prepareDate = hasPrepareDate ? data.specificMeal.prepareAsDate : defaultPrepareDate
    const condition = !this.data.specificMeal.prepare && !this.dayBeforeDate;

    this.prepareForm = this.formBuilder.group({
      hasPrepareDate: new FormControl({value: hasPrepareDate, disabled: condition}),
      prepareDate: prepareDate
    });

    // Create a Change Listener, which is used to activate the save button
    const originalValues = JSON.stringify(this.prepareForm.value);
    this.prepareForm.valueChanges.subscribe(values => {
      this.dataHasNotChanged = JSON.stringify(values) === originalValues;
    });

  }


  /**
   * Mahlzeiten können nur mind. ein Tag vorher vorbereitet werden.
   * Ausserdem können sie nur vor dem Lager oder während dem Lager an einem
   * existierenden Tag vorbereitet werden.
   *
   */
  public dateFilter = (dateToCheck: string | null): boolean => {

    if (dateToCheck == null) return;

    const date = new Date(dateToCheck);
    const dayInWeekviewExists = this.data.days.filter(day => day.dateAsTypeDate.getTime() === date.getTime()).length;
    return dayInWeekviewExists && date.getTime() < this.data.specificMeal.date.toDate().getTime();

  }

  /**
   * Returns the updated specificMeal
   */
  public returnsSpecificMeal() {

    // Default Value
    this.data.specificMeal.prepare = false;

    if (this.prepareForm.value.hasPrepareDate) {
      this.data.specificMeal.prepareAsDate = this.prepareForm.value.prepareDate;
      this.data.specificMeal.prepare = true;
    }

    return this.data.specificMeal;

  }

}
