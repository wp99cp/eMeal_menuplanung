import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {HelpService} from '../../_service/help.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatStepperIntl} from '@angular/material/stepper';

@Component({
  selector: 'app-export-settings',
  templateUrl: './export-settings.component.html',
  styleUrls: ['./export-settings.component.sass'],
  providers: [{provide: MatStepperIntl, useClass: MatStepperIntl}],
})
export class ExportSettingsComponent implements OnInit {

  formGroup: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public campId: string,
    public dialogRef: MatDialogRef<ExportSettingsComponent>,
    public helpService: HelpService,
    formBuilder: FormBuilder,
    private _matStepperIntl: MatStepperIntl
  ) {

    this._matStepperIntl.optionalLabel = 'Einstellungen ändern';


    this.formGroup = formBuilder.group({
      shoppingList: true,
      invertIngredients: false,
      meals: true,
      weekView: true,
      prepareMeals: true,
      feedbackPage: false,
      nCols: 2,
      minNIng: 1,
      feedbackMessage: "Rückmeldungen erlauben uns im nächsten Lager noch feineres Essen zu kochen. " +
        "Bewerte die Mahlzeiten mit 1-5 Sternen (1=sehr schlecht, 5=ausgezeichnet). Wir danken für dein Feedback."
    });

  }

  ngOnInit(): void {

    console.log(this.campId);

  }

  generatePDF() {

    const optionalArgs = {};

    if (this.formGroup.value.shoppingList) {
      optionalArgs['--spl'] = '';
      optionalArgs['--ncols'] = this.formGroup.value.nCols;
    }

    if (this.formGroup.value.invertIngredients) {
      optionalArgs['--invm'] = '';
    }

    if (this.formGroup.value.meals) {
      optionalArgs['--meals'] = '';
    }

    if (this.formGroup.value.weekView) {
      optionalArgs['--wv'] = '';
    }

    if (this.formGroup.value.prepareMeals) {
      optionalArgs['--mp'] = '';
    }

    if (this.formGroup.value.feedbackPage) {
      optionalArgs['--fdb'] = '';
      optionalArgs['--fdbmsg'] = this.formGroup.value.feedbackMessage;

    }

    this.dialogRef.close({legacy: false, campId: this.campId, optionalArgs});

  }

  legacyPDCreation() {

    this.dialogRef.close({legacy: true, campId: this.campId});

  }

}
