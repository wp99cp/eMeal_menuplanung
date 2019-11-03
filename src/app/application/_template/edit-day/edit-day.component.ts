import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-day',
  templateUrl: './edit-day.component.html',
  styleUrls: ['./edit-day.component.sass']
})
export class EditDayComponent implements OnInit {

  private dayInfo: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data, private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.dayInfo = this.formBuilder.group({

      description: this.data.name.description,
      date: this.data.name.dateAsTypeDate

    });

  }

  delete() {

    this.data.name

  }

  saveDayData() {

    this.data.name.dateAsTypeDate = this.dayInfo.value.date;
    this.data.name.description = this.dayInfo.value.description;

  }

}
