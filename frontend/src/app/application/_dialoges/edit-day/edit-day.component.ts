import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

import {Day} from '../../_class/day';
import {SpecificMeal} from '../../_class/specific-meal';
import {SwissDateAdapter} from 'src/app/utils/format-datapicker';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';

import 'moment/locale/de';
import {Moment} from "moment";

@Component({
  selector: 'app-edit-day',
  templateUrl: './edit-day.component.html',
  styleUrls: ['./edit-day.component.sass'],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'de-CH'},
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
  ]
})
export class EditDayComponent implements OnInit {

  public dayInfo: FormGroup;
  private currentDate;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { day: Day, specificMeals: SpecificMeal[], days: Day[], access: boolean },
    private formBuilder: FormBuilder,
    public swissDateAdapter: SwissDateAdapter) {
  }

  ngOnInit() {

    this.currentDate = this.data.day.dateAsTypeDate;

    this.dayInfo = this.formBuilder.group({

      description: this.data.day.description,
      date: this.data.day.dateAsTypeDate,
      notes: this.data.day.notes

    });

    if (!this.data.access) this.dayInfo.disable();

  }

  /**
   * Mahlzeiten können nur mind. ein Tag vorhher vorbereitet werden.
   *
   */
  public dateFilter = (d: Moment | null): boolean => {

    if (d === null) {
      return;
    }

    const withSameDate = this.data.days.filter(day => day.dateAsTypeDate?.getDate() === d.toDate().getDate());
    return withSameDate.length === 0 || d.date() === this.currentDate.getDate();

  }


  saveDayData() {

    this.data.day.dateAsTypeDate = this.dayInfo.value.date.toDate();
    this.data.day.description = this.dayInfo.value.description;
    this.data.day.notes = this.dayInfo.value.notes;

  }

}
