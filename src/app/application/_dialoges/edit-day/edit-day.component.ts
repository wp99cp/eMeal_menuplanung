import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Day } from '../../_class/day';
import { SpecificMeal } from '../../_class/specific-meal';

@Component({
  selector: 'app-edit-day',
  templateUrl: './edit-day.component.html',
  styleUrls: ['./edit-day.component.sass']
})
export class EditDayComponent implements OnInit {

  public dayInfo: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { day: Day, specificMeals: SpecificMeal[] }, private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.dayInfo = this.formBuilder.group({

      description: this.data.day.description,
      date: this.data.day.dateAsTypeDate

    });

  }

  saveDayData() {

    this.data.day.dateAsTypeDate = this.dayInfo.value.date;
    this.data.day.description = this.dayInfo.value.description;

  }

}
