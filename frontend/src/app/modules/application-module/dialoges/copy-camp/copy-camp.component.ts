import {Component, Inject} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';
import {Camp} from '../../classes/camp';

import 'moment/locale/de';

/**
 * The name and the days of the copy of a camp.
 */
export interface CopyCampResult {
  name: string;
  days: number[];
}

const MAX_NAME_LENGTH = 32;

@Component({
  standalone: false,
  selector: 'app-copy-camp',
  templateUrl: './copy-camp.component.html',
  styleUrls: ['./copy-camp.component.sass'],
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
export class CopyCampComponent {

  public copyCampForm: UntypedFormGroup;

  // the days of the camp, sorted by date
  private readonly days: Date[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public camp: Camp,
    formBuilder: UntypedFormBuilder) {

    this.days = camp.days.map(day => day.dateAsTypeDate).sort((a, b) => a.getTime() - b.getTime());

    this.copyCampForm = formBuilder.group({
      name: [('Kopie von ' + camp.name).substring(0, MAX_NAME_LENGTH),
        [Validators.required, Validators.pattern(/\S/), Validators.maxLength(MAX_NAME_LENGTH)]],
      start: [this.days[0], Validators.required]
    });

  }

  /**
   * The copy starts on the selected date. Its days keep their distance to the first day, a camp can have gaps.
   */
  public copyCamp(): CopyCampResult {

    // the datepicker replaces the initial Date with a Moment once the date is changed
    const start = new Date(this.copyCampForm.value.start);

    const dayOfYear = (date: Date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
    const days = this.days.map(day => new Date(start.getFullYear(), start.getMonth(),
      start.getDate() + dayOfYear(day) - dayOfYear(this.days[0])).getTime());

    return {name: this.copyCampForm.value.name.trim(), days};

  }

}
