import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HelpService} from '../../_service/help.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-export-settings',
  templateUrl: './export-settings.component.html',
  styleUrls: ['./export-settings.component.sass']
})
export class ExportSettingsComponent implements OnInit {

  formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public campId: string,
    public dialogRef: MatDialogRef<ExportSettingsComponent>,
    public helpService: HelpService,
    formBuilder: FormBuilder
  ) {

    this.formGroup = formBuilder.group({
      shoppingList: true,
      meals: true,
      weekView: true
    });

  }

  ngOnInit(): void {

    console.log(this.campId);

  }

  generatePDF() {

    const optionalArgs = {};

    if (this.formGroup.value.shoppingList) {
      optionalArgs['--spl'] = '';
    }

    if (this.formGroup.value.meals) {
      optionalArgs['--meals'] = '';
    }

    if (this.formGroup.value.weekView) {
      optionalArgs['--wv'] = '';
    }

    this.dialogRef.close({legacy: false, campId: this.campId, optionalArgs});

  }

  legacyPDCreation() {

    this.dialogRef.close({legacy: true, campId: this.campId});

  }

}
