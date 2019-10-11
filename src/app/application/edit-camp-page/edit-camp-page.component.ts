import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Camp } from '../_class/camp';
import { Observable, Observer } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit {

  // Toggle for saveButton
  private saveButtonActive = false;

  // camp Data from server
  private camp: Observable<Camp>;

  // local changes to the camp data (not sync with server)
  private unsavedCamp: Camp = null;

  constructor(private route: ActivatedRoute, private db: AngularFirestore) { }

  ngOnInit() {

    // load camp from url
    this.route.url.subscribe(url =>
      this.loadCamp(url[1].path));
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
          (docRef) => observer.next(new Camp(docRef.payload.data(), docRef.payload.id, this.db)),
          (error) => observer.error(error)
        );
    });

  }


  /**
   * 
   */
  save() {

    this.unsavedCamp.pushToFirestoreDB();
    console.log(this.unsavedCamp);
    this.saveButtonActive = false;


  }

  /**
   * 
   * @param str 
   * @param field 
   */
  onValueChange(str: string, field: string) {

    str = str.toString().replace(/<[^>]*>/g, '');

    this.camp.subscribe(camp => {

      this.saveButtonActive = true;

      switch (field) {
        case 'name': camp.name = str; break;
        case 'description': camp.description = str; break;
        case 'participants': camp.participants = Number.parseInt(str); break;
      }

      this.unsavedCamp = camp;

    });

  }

}