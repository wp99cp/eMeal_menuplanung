import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, MatSort } from '@angular/material';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { firestore } from 'firebase';
import { Observable } from 'rxjs';

import { Camp } from '../../_class/camp';
import { FirestoreObject } from '../../_class/firebaseObject';
import { DeleteCampComponent } from '../../_dialoges/delete-camp/delete-camp.component';
import { AccessData, FirestoreCamp } from '../../_interfaces/firestoreDatatypes';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { customPaginator } from './customPaginator';

/**
 * CampListPageComponent
 *
 * Page with a list of all editableCamps
 *
 */
@Component({
  selector: 'app-camp-list-page',
  templateUrl: './camp-list-page.component.html',
  styleUrls: ['./camp-list-page.component.sass'],
  providers: [
    { provide: MatPaginatorIntl, useValue: customPaginator() }]
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

    // create default values for addCampForms
    this.newCampInfos = this.formBuilder.group({ name: '', description: '', });
    this.newCampParticipants = this.formBuilder.group({ participants: '' });
    this.newCampDate = this.formBuilder.group({ date: '' });

  }

  /**
   * Loads the editableCamps from the database.
   *
   */
  ngOnInit() {

    this.camps = this.databaseService.getEditableCamps();

  }


  ngAfterViewInit() {

    // Update MatTableDataSource
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Eigenschaft für die Sortierung
    this.dataSource.sortingDataAccessor = this.sortingAccessor();

    // updates the dataSource
    this.camps.subscribe(camps => this.dataSource.data = camps);

  }



  private sortingAccessor(): (data: Camp, sortHeaderId: string) => string | number {

    return (item, property) => {
      switch (property) {
        case 'name': return item.name.toLowerCase();
        case 'description': return (item.description !== null) ? item.description.toLowerCase() : '';
        case 'year': return item.year;
        default: return item[property];
      }
    };

  }

  /**
   * Creates a new Camp
   *
   */
  public createCamp(campCreator: MatStepper) {

    this.auth.getCurrentUser().subscribe(user => {

      const date = new Date(this.newCampDate.value.date);

      // creates empty document
      const campData = FirestoreObject.exportEmptyDocument(user.uid) as FirestoreCamp;

      campData.camp_name = this.newCampInfos.value.name;
      campData.camp_description = this.newCampInfos.value.description;
      campData.camp_year = date.toLocaleDateString('de-CH', { year: 'numeric' });
      campData.days = [{ day_date: firestore.Timestamp.fromDate(date), day_description: '' }];
      campData.camp_participants = this.newCampParticipants.value.participants;
      campData.camp_vegetarians = 0;
      campData.camp_leaders = 0;

      // Creates a new Camp and resets form
      this.databaseService.addDocument(campData, 'camps')
        .then(() => campCreator.reset());

    });

  }

  /**
   * Deletes the selected camp
   *
   */
  public deleteCamp(camp: Camp) {

    this.dialog.open(DeleteCampComponent, {
      height: '400px',
      width: '560px',
      data: { name: camp.name }
    }).afterClosed()
      .subscribe(deleteConfirmed => {

        if (deleteConfirmed) {

          this.databaseService.deleteDocument(camp);
          this.databaseService.deleteAllMealsAndRecipes(camp.documentId);
        }

      });

  }


}

