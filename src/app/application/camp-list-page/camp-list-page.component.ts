import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_service/authentication.service';
import { Camp } from '../_class/camp';
import { map } from 'rxjs/operators'

@Component({
  selector: 'app-camp-list-page',
  templateUrl: './camp-list-page.component.html',
  styleUrls: ['./camp-list-page.component.sass']
})
export class CampListPageComponent implements OnInit {

  private camps: Observable<Camp[]>;
  private user: firebase.User;

  /**
   * 
   * @param auth 
   * @param db 
   */
  constructor(private auth: AuthenticationService, private db: AngularFirestore) { }

  ngOnInit() {

    this.auth.fireAuth.authState.subscribe(user => {
      if (user) {
        this.user = user
        this.campListPage();
      }
    });

  }

  campListPage() {

    // load Camps as Observable<Camp[]>
    this.camps = Observable.create(observer => {

      this.db.collection('camps', collRef => collRef.where('access.owner', "array-contains", this.user.uid)).snapshotChanges()
        .pipe(
          map(docActions => docActions.map(docAction => new Camp(docAction.payload.doc.data(), docAction.payload.doc.id, this.db)))
        )
        .subscribe(camps => observer.next(camps));

    });

  }

}
