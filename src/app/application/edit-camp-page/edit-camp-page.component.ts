import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { Camp } from '../_class/camp';
import { FirestoreCamp } from '../_interfaces/firestore-camp';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit {

  // Toggle for saveButton
  private campInfos: FormGroup;

  // camp Data from server
  private camp: Observable<Camp>;

  // local changes to the camp data (not sync with server)
  constructor(private route: ActivatedRoute, private db: AngularFirestore, private formBuilder: FormBuilder) { }

  ngOnInit() {

    // load camp from url
    this.route.url.subscribe(url =>
      this.loadCamp(url[1].path));

    // set form values
    this.camp.subscribe(camp => this.campInfos = this.formBuilder.group({
      name: camp.name,
      description: camp.description,
      participants: camp.participants
    }));

  }


  /**
   * Loads a camp form the database
   * 
   * @param campId Id of the camp
   */
  loadCamp(campId: string) {

    // TODO: evtl. Zusammenfassbar mit den anderen Abfragen -> Auslagerung in ein Service...
    this.camp = Observable.create((observer: Observer<Camp>) => {
      this.db.doc(Camp.CAMPS_DIRECTORY + campId)
        .snapshotChanges().subscribe(
          (docRef) => observer.next(new Camp(docRef.payload.data() as FirestoreCamp, docRef.payload.id, this.db)),
          (error) => observer.error(error)
        );
    });

  }

  /** Save and reset the form */
  saveCampInfo() {

    this.camp.subscribe(camp => {

      // save data to firestore
      camp.name = this.campInfos.value.name;
      camp.description = this.campInfos.value.description;
      camp.participants = this.campInfos.value.participants;
      camp.pushToFirestoreDB();

      // reset: deactivate save button
      this.campInfos.markAsUntouched();

    });

  }




}