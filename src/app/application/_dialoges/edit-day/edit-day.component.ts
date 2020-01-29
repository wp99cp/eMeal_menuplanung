import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Day } from '../../_class/day';

@Component({
  selector: 'app-edit-day',
  templateUrl: './edit-day.component.html',
  styleUrls: ['./edit-day.component.sass']
})
export class EditDayComponent implements OnInit {

  public dayInfo: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { day: Day }, private formBuilder: FormBuilder) { }

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
