import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { firestore } from 'firebase';
import { map } from 'rxjs/operators';
import { FirestoreObject } from '../../_class/firebaseObject';
import { FirestoreCamp } from '../../_interfaces/firestoreDatatypes';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-create-camp',
  templateUrl: './create-camp.component.html',
  styleUrls: ['./create-camp.component.sass']
})
export class CreateCampComponent {

  // Form data to create new Camp
  public newCampInfos: FormGroup;
  public newCampParticipants: FormGroup;
  public newCampDate: FormGroup;

  constructor(private formBuilder: FormBuilder,
    public dbService: DatabaseService,
    private authService: AuthenticationService) {

    // create default values for addCampForms
    this.newCampInfos = this.formBuilder.group({ name: '', description: '', });
    this.newCampParticipants = this.formBuilder.group({ participants: '' });
    this.newCampDate = this.formBuilder.group({ date: '' });

  }

  /**
   * Creates a new Camp
   *
   */
  public createCamp() {

    const date = new Date(this.newCampDate.value.date);

    return this.authService.getCurrentUser().pipe(map(user => {

      // creates empty document
      const campData = FirestoreObject.exportEmptyDocument(user.uid) as FirestoreCamp;

      campData.camp_name = this.newCampInfos.value.name;
      campData.camp_description = this.newCampInfos.value.description;
      campData.camp_year = date.toLocaleDateString('de-CH', { year: 'numeric' });
      campData.days = [{ day_date: firestore.Timestamp.fromDate(date), day_description: '', day_notes: '' }];
      campData.camp_participants = this.newCampParticipants.value.participants;
      campData.camp_vegetarians = 0;
      campData.camp_leaders = 0;

      // Creates a new Camp and resets form
      return campData;

    }));

  }

}
