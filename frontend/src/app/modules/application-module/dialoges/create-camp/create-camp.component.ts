import {Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import firebase from 'firebase/compat/app';
import {map} from 'rxjs/operators';
import {FirestoreObject} from '../../classes/firebaseObject';
import {DayData, FirestoreCamp} from '../../interfaces/firestoreDatatypes';
import {AuthenticationService} from '../../services/authentication.service';
import {DatabaseService} from '../../services/database.service';
import {HelpService} from '../../services/help.service';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
  MomentDateAdapter
} from '@angular/material-moment-adapter';

import 'moment/locale/de';
import Timestamp = firebase.firestore.Timestamp;

@Component({
  selector: 'app-create-camp',
  templateUrl: './create-camp.component.html',
  styleUrls: ['./create-camp.component.sass'],
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
export class CreateCampComponent {

  // Form data to create new CampClass
  public newCampInfos: UntypedFormGroup;
  public newCampParticipants: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,
              public dbService: DatabaseService,
              private authService: AuthenticationService,
              public helpService: HelpService) {

    // create default values for addCampForms
    this.newCampInfos = this.formBuilder.group({name: '', description: '', start: '', end: ''});
    this.newCampParticipants = this.formBuilder.group({participants: 12, leaders: 0, vegetarians: 0});

  }

  private nextDay(date) {
    date.setDate(date.getDate() + 1);
    return date;
  }

  private getDates(startDate, stopDate) {
    const dateArray = new Array();
    let currentDate = startDate;
    while (currentDate <= stopDate) {
      dateArray.push(new Date(currentDate));
      currentDate = this.nextDay(currentDate);
    }
    return dateArray;
  }

  /**
   * Creates a new CampClass
   *
   */
  public createCamp() {

    const startDate = new Date(this.newCampInfos.value.start);
    const endDate = new Date(this.newCampInfos.value.end);

    return this.authService.getCurrentUser().pipe(map(user => {

      // creates empty document
      const campData = FirestoreObject.exportEmptyDocument(user.uid) as FirestoreCamp;

      campData.camp_name = this.newCampInfos.value.name;
      campData.camp_description = this.newCampInfos.value.description;
      campData.camp_year = startDate.toLocaleDateString('de-CH', {year: 'numeric'});
      campData.days = this.getDates(startDate, endDate).map(day => {
        return {day_date: Timestamp.fromDate(day), day_description: '', day_notes: ''} as DayData;
      });
      campData.camp_participants = this.newCampParticipants.value.participants;
      campData.camp_vegetarians = this.newCampParticipants.value.vegetarians;
      campData.camp_leaders = this.newCampParticipants.value.leaders;

      // Creates a new CampClass and resets form
      return campData;

    }));

  }

}
