import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Camp } from '../../classes/camp';
import { DatabaseService } from '../../services/database.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {HelpService} from '../../services/help.service';

/**
 * CampInfoComponent ist ein Dialog zum bearbeiten der CampClass-Infos
 */
@Component({
  selector: 'app-camp-info',
  templateUrl: './camp-info.component.html',
  styleUrls: ['./camp-info.component.sass']
})
export class CampInfoComponent {

  public campInfosForm: FormGroup;
  public camp: Camp;

  public hasAccess: Promise<boolean>
  public valueHasNotChanged = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp },
    formBuilder: FormBuilder,
    dbService: DatabaseService,
    public helpService: HelpService) {

    this.camp = data.camp;
    this.campInfosForm = formBuilder.group({
      name: this.camp.name,
      description: this.camp.description,
      participants: this.camp.participants,
      vegetarier: this.camp.vegetarians ? this.camp.vegetarians : 0,
      leaders: this.camp.leaders ? this.camp.leaders : 0
    });


    const originalValues = JSON.stringify({

      name: this.camp.name,
      description: this.camp.description,
      participants: this.camp.participants,
      vegetarier: this.camp.vegetarians ? this.camp.vegetarians : 0,
      leaders: this.camp.leaders ? this.camp.leaders : 0

    });

    // set up change listner
    this.campInfosForm.valueChanges.subscribe(values => {
      this.valueHasNotChanged = JSON.stringify(values) === originalValues;
    });

    this.hasAccess = dbService.canWrite(this.camp);
    this.hasAccess.then(access => { if (!access) this.campInfosForm.disable() });

  }

  /** saved the changed values form the form */
  public saveValueChanges(): Camp {
    this.camp.name = this.campInfosForm.value.name;
    this.camp.description = this.campInfosForm.value.description;
    this.camp.participants = this.campInfosForm.value.participants;
    this.camp.vegetarians = this.campInfosForm.value.vegetarier;
    this.camp.leaders = this.campInfosForm.value.leaders;

    return this.camp;
  }

}
