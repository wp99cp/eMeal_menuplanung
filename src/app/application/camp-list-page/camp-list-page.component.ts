import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_service/authentication.service';
import { Camp } from '../_class/camp';
import { map } from 'rxjs/operators'
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-camp-list-page',
  templateUrl: './camp-list-page.component.html',
  styleUrls: ['./camp-list-page.component.sass']
})
export class CampListPageComponent implements OnInit {

  private displayedColumns: string[] = ['name', 'description', 'year', 'participants'];

  private dataSource: MatTableDataSource<Camp>;

  private camps: Observable<Camp[]>;
  private user: firebase.User;


  /**
   * 
   * @param auth 
   * @param db 
   */
  constructor(private auth: AuthenticationService, private db: AngularFirestore) {

    this.dataSource = new MatTableDataSource();

  }



  ngOnInit() {

    this.auth.fireAuth.authState.subscribe(user => {
      if (user) {
        this.user = user
        this.campListPage();

        this.camps.subscribe((camps: Camp[]) => {
          this.dataSource = new MatTableDataSource(camps)
        });


      }
    });

  }

  /**
   * 
   * Filter nach Name des Lagers
   * 
   * @param filterValue 
   */
  applyFilter(filterValue: string) {
    this.dataSource.filterPredicate = (camp: Camp, filter: string) =>
      camp.name.trim().toLowerCase().includes(filter);
    this.dataSource.filter = filterValue.trim().toLowerCase();
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
