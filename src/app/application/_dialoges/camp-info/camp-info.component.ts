import { Component, OnInit, Input, Inject } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Camp } from '../../_class/camp';
import { MAT_DIALOG_DATA } from '@angular/material';

/**
 * CampInfoComponent ist ein Dialog zum bearbeiten der Camp-Infos
 */
@Component({
  selector: 'app-camp-info',
  templateUrl: './camp-info.component.html',
  styleUrls: ['./camp-info.component.sass']
})
export class CampInfoComponent {

  public campInfosForm: FormGroup;
  public camp: Camp;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp },
    formBuilder: FormBuilder) {

    this.camp = data.camp;
    this.campInfosForm = formBuilder.group({
      name: this.camp.name,
      description: this.camp.description,
      participants: this.camp.participants,
      vegetarier: this.camp.vegetarians ? this.camp.vegetarians : 0
    });

  }

  /** saved the changed values form the form */
  public saveValueChanges(): Camp {
    this.camp.name = this.campInfosForm.value.name;
    this.camp.description = this.campInfosForm.value.description;
    this.camp.participants = this.campInfosForm.value.participants;
    this.camp.vegetarians = this.campInfosForm.value.vegetarier;

    return this.camp;
  }

}
