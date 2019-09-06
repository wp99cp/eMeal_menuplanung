import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Camp } from '../_class/camp';
import { Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/firestore';


@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit {

  private saveButtonActive = false;

  private camp: Observable<Camp>;
  private unsavedCamp: Camp = null;

  constructor(private route: ActivatedRoute, private db: AngularFirestore) { }

  ngOnInit() {

    this.route.url.subscribe(url => this.loadCamp(url[1].path));

  }

  loadCamp(campId: string) {

    this.camp = Observable.create(observer => {
      this.db.doc('camps/' + campId).snapshotChanges().subscribe(docRef => {
        observer.next(new Camp(docRef.payload.data(), docRef.payload.id, this.db))
      });
    });

  }

  save() {

    this.unsavedCamp.push();
    console.log(this.unsavedCamp);
    this.saveButtonActive = false;


  }

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