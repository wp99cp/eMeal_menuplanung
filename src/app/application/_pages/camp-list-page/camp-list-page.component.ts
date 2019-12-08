import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { firestore } from 'firebase';
import { Observable } from 'rxjs';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';
import { Camp } from '../../_class/camp';
import { FirestoreCamp } from '../../_interfaces/firestore-camp';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';


@Component({
  selector: 'app-camp-list-page',
  templateUrl: './camp-list-page.component.html',
  styleUrls: ['./camp-list-page.component.sass']
})
export class CampListPageComponent implements OnInit {

  // Datasource and colums for the table
  public displayedColumns: string[] = ['name', 'description', 'year', 'participants', 'menu'];
  public dataSource: MatTableDataSource<Camp>;

  // Camp Data
  public camps: Observable<Camp[]>;

  // Form data to create new Camp
  public newCampInfos: FormGroup;
  public newCampParticipants: FormGroup;
  public newCampDate: FormGroup;
  private selectedCoworkers: User[];

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


  }

  /**
   * 
   */
  ngOnInit() {

    this.setHeaderInfo();

    this.camps = this.databaseService.getEditableCamps();

    // Update MatTableDataSource
    this.camps.subscribe((camps: Camp[]) => {
      this.dataSource = new MatTableDataSource(camps)
    });

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {

    Header.title = 'Meine Lager';
    Header.path = ['eMeal', 'meine Lager'];

  }

  /**
   * 
   * Filter nach Name des Lagers
   * 
   * @param filterValue 
   */
  applyFilter(filterValue: string) {
    this.dataSource.filterPredicate = (camp: Camp, filter: string) =>
      // Condition for the filter
      camp.name.trim().toLowerCase().includes(filter);

    // apply filter to the table
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  /**
   * Creats a new Camp
   */
  createCamp() {

    this.auth.getCurrentUser().subscribe(user => {

      let date = new Date(this.newCampDate.value.date);

      // combinde data
      let campData: FirestoreCamp = {
        name: this.newCampInfos.value.name,
        description: this.newCampInfos.value.description,
        access: { owner: [user.uid], editor: Camp.generateCoworkersList(user.uid, this.selectedCoworkers) },
        year: date.toLocaleDateString('de-CH', { year: 'numeric' }),
        days: [{
          date: firestore.Timestamp.fromDate(date),
          meals: [],
          description: ''
        }],
        participants: this.newCampParticipants.value.participants
      };


      // Creates a new Camp
      this.databaseService.addDocument(campData, 'camps');
    });


  }

  /** A user get selected */
  selectUser(selectedCoworkers) {

    this.selectedCoworkers = selectedCoworkers;

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

        this.databaseService.deleteDocument(camp);

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
