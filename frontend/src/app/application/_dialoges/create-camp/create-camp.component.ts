import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {firestore} from 'firebase/app';
import {map} from 'rxjs/operators';
import {FirestoreObject} from '../../_class/firebaseObject';
import {DayData, FirestoreCamp} from '../../_interfaces/firestoreDatatypes';
import {AuthenticationService} from '../../_service/authentication.service';
import {DatabaseService} from '../../_service/database.service';
import {HelpService} from '../../_service/help.service';

@Component({
    selector: 'app-create-camp',
    templateUrl: './create-camp.component.html',
    styleUrls: ['./create-camp.component.sass']
})
export class CreateCampComponent {

    // Form data to create new Camp
    public newCampInfos: FormGroup;
    public newCampParticipants: FormGroup;

    constructor(private formBuilder: FormBuilder,
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
     * Creates a new Camp
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
                return {day_date: firestore.Timestamp.fromDate(day), day_description: '', day_notes: ''} as DayData;
            });
            campData.camp_participants = this.newCampParticipants.value.participants;
            campData.camp_vegetarians = this.newCampParticipants.value.vegetarians;
            campData.camp_leaders = this.newCampParticipants.value.leaders;

            // Creates a new Camp and resets form
            return campData;

        }));

    }

}
