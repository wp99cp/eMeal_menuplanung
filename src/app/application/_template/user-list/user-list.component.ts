import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { map, mergeMap } from 'rxjs/operators';

import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { FirestoreUser } from '../../_interfaces/firestoreDatatypes';



@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.sass']
})
export class UserListComponent implements OnInit {

  @Output() afterSelection = new EventEmitter<FirestoreUser[]>();

  public selection = new SelectionModel<FirestoreUser>(true, []);
  public displayedColumns: string[] = ['select', 'displayName', 'email'];
  public userList = new MatTableDataSource<FirestoreUser>();

  constructor(private dbService: DatabaseService, private authService: AuthenticationService, public snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.dbService.getVisibleUsers()
      .pipe(this.removeCurrentUser())
      .subscribe((users: FirestoreUser[]) => {

        this.userList = new MatTableDataSource<FirestoreUser>(users);
        this.userList.filterPredicate = this.userFilterPredicate();
        this.userList.filter = 'NO-NAME';

      });

  }



  private userFilterPredicate(): (data: FirestoreUser, filter: string) => boolean {

    return (user: FirestoreUser, filter: string) =>
      // Condition for the filter
      (filter.trim().length >= 3 && user.displayName.trim().toLowerCase().includes(filter))
      || this.selection.isSelected(user);

  }

  private removeCurrentUser() {

    return mergeMap((users: FirestoreUser[]) => this.authService.getCurrentUser()
      .pipe(map(currentUser => users.filter(user => user.uid !== currentUser.uid))));

  }

  public applyFilter(filterValue: string) {

    if (filterValue.trim().length < 3) {
      this.userList.filter = 'NO-NAME';
      return;
    }

    // apply filter to the table
    this.userList.filter = filterValue.trim().toLowerCase();

  }


  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.userList.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.userList.data.forEach(user => this.selection.select(user));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(user?: FirestoreUser): string {
    if (!user) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(user) ? 'deselect' : 'select'} row ${user.uid}`;
  }

  coworkersSelected() {
    this.afterSelection.emit(this.selection.selected);
    this.selection.clear();
    this.snackBar.open('Ausgewählte Nutzer wurden hinzugefügt.', '', { duration: 2000 });


  }

}
