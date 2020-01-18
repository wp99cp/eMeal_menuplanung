import { Component, Inject, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, MatSort } from '@angular/material';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { firestore } from 'firebase';
import { Observable, Observer } from 'rxjs';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { Camp } from '../../_class/camp';
import { FirestoreCamp } from '../../_interfaces/firestore-camp';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { MatPaginatorIntl } from '@angular/material';
import { AccessData } from '../../_interfaces/accessData';
import { map } from 'rxjs/operators';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();
  customPaginatorIntl.itemsPerPageLabel = 'Lager pro Seite';
  customPaginatorIntl.getRangeLabel = ((page: number, pageSize: number, length: number) => {

    length = Math.max(length, 0);
    const startIndex = (page * pageSize === 0 && length !== 0) ? 1 : page * pageSize;
    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = Math.min(startIndex - 1 + pageSize, length);
    return startIndex + " bis " + endIndex + " von " + length
  });

  return customPaginatorIntl;
}

@Component({
  selector: 'app-camp-list-page',
  templateUrl: './camp-list-page.component.html',
  styleUrls: ['./camp-list-page.component.sass'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class CampListPageComponent implements AfterViewInit, OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  // Datasource and colums for the table
  public displayedColumns: string[] = ['name', 'description', 'year', 'participants', 'menu'];
  public dataSource: MatTableDataSource<Camp>;

  // Camp Data
  public camps: Observable<Camp[]>;

  // Form data to create new Camp
  public newCampInfos: FormGroup;
  public newCampParticipants: FormGroup;
  public newCampDate: FormGroup;
  public access: AccessData;

  constructor(
    public dialog: MatDialog,
    private databaseService: DatabaseService,
    private auth: AuthenticationService,
    private formBuilder: FormBuilder) {

    this.dataSource = new MatTableDataSource();


    // Create new camp; data form form
    // Here you can defind defaults values for the form fields
    this.newCampInfos = this.formBuilder.group({
      name: '',
      description: '',
    });

    this.newCampParticipants = this.formBuilder.group({
      participants: ''
    });

    this.newCampDate = this.formBuilder.group({
      date: ''
    });

    auth.getCurrentUser().pipe(map(user => {
      const accessData: AccessData = { [user.uid]: 'owner' };
      return accessData;
    })).subscribe(access => { this.access = access; });

  }

  ngOnInit() {

    this.setHeaderInfo();
    this.camps = this.databaseService.getEditableCamps();

  }

  /**
   *
   */
  ngAfterViewInit() {

    // Update MatTableDataSource
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Eigenschaft für die Sortierung
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name': return item.name.toLowerCase();
        case 'description': return (item.description !== null) ? item.description.toLowerCase() : '';
        case 'year': return item.year;
        default: return item[property];
      }
    };

    this.camps.subscribe(camps => {
      this.dataSource.data = camps;
    });

  }



  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {

    Header.title = 'Meine Lager';
    Header.path = ['Startseite', 'meine Lager'];

  }

  /**
   * Creats a new Camp
   */
  createCamp(campCreator: MatStepper) {


    const date = new Date(this.newCampDate.value.date);

    // combinde data
    const campData: FirestoreCamp = {
      name: this.newCampInfos.value.name,
      description: this.newCampInfos.value.description,
      access: this.access,
      year: date.toLocaleDateString('de-CH', { year: 'numeric' }),
      days: [{
        date: firestore.Timestamp.fromDate(date),
        meals: [],
        description: ''
      }],
      participants: this.newCampParticipants.value.participants,
      vegetarier: 0
    };

    // Creates a new Camp
    this.databaseService.addDocument(campData, 'camps')

      // reset form
      .then(() => campCreator.reset());


  }

  /** A user get selected */
  selectUser(selectedCoworkers) {

    this.auth.getCurrentUser().pipe(map(user => {
      const accessData = Camp.generateCoworkersList(user.uid, selectedCoworkers);
      accessData[user.uid] = 'owner';
      return accessData;
    })).subscribe(access => { this.access = access; });

  }

  /**
   * Deletes a selected camp
   */
  deleteCamp(camp: Camp) {

    this.dialog.open(DeleteCampComponent, {
      height: '200px',
      width: '300px',
      data: { name: camp.name }
    }).afterClosed().subscribe(deleteConfirmed => {

      if (deleteConfirmed) {

        this.databaseService.deleteCamp(camp);

      }

    });

  }


}


@Component({
  templateUrl: './delete-camp.component.html',
  styleUrls: ['./delete-camp.component.sass']
})
export class DeleteCampComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {

  }

}
