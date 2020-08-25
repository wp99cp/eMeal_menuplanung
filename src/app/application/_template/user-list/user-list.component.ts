import {SelectionModel} from '@angular/cdk/collections';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {map, mergeMap} from 'rxjs/operators';

import {AuthenticationService} from '../../_service/authentication.service';
import {DatabaseService} from '../../_service/database.service';
import {accessLevel} from '../../_interfaces/firestoreDatatypes';
import {User} from '../../_class/user';
import {MatSnackBar} from '@angular/material/snack-bar';

export interface UserWithAccess extends User {
  accessLevel: accessLevel;
}

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.sass']
})
export class UserListComponent implements OnInit {

  @Output() afterSelection = new EventEmitter<UserWithAccess[]>();
  @Input() public accessLevels: string[];

  public selection = new SelectionModel<UserWithAccess>(true, []);
  public displayedColumns: string[] = ['select', 'displayName', 'email', 'accessLevel'];
  public userList = new MatTableDataSource<UserWithAccess>();

  constructor(private dbService: DatabaseService, private authService: AuthenticationService, public snackBar: MatSnackBar) {
  }

  ngOnInit(): void {


    this.dbService.getVisibleUsers()
      .pipe(this.removeCurrentUser())
      .pipe(map((users: UserWithAccess[]) => {
        users.forEach(user => user.accessLevel = 'viewer');
        return users;
      }))
      .subscribe((users: UserWithAccess[]) => {

        this.userList = new MatTableDataSource<UserWithAccess>(users);
        this.userList.filterPredicate = this.userFilterPredicate();
        this.userList.filter = 'NO-NAME';

      });

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
  checkboxLabel(user?: UserWithAccess): string {
    if (!user) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(user) ? 'deselect' : 'select'} row ${user.uid}`;
  }

  coworkersSelected() {
    this.afterSelection.emit(this.selection.selected);
    this.selection.clear();
    this.snackBar.open('Ausgewählte Nutzer wurden hinzugefügt.', '', {duration: 2000});

  }

  private userFilterPredicate(): (data: UserWithAccess, filter: string) => boolean {

    return (user: UserWithAccess, filter: string) =>

      // Condition for the filter
      (user.displayName !== null && filter.trim().length >= 3 &&
        user.displayName.trim().toLowerCase().includes(filter.toLowerCase()) &&
        filter.toLowerCase() !== 'v/o')

      || this.selection.isSelected(user);

  }

  private removeCurrentUser() {

    return mergeMap((users: UserWithAccess[]) => this.authService.getCurrentUser()
      .pipe(map(currentUser => users.filter(user => user.uid !== currentUser.uid))));

  }

}
