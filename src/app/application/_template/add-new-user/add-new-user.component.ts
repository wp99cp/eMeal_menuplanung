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
  selector: 'app-add-new-user',
  templateUrl: './add-new-user.component.html',
  styleUrls: ['./add-new-user.component.sass']
})
export class AddNewUserComponent implements OnInit {

  @Output() afterSelection = new EventEmitter<UserWithAccess>();
  @Input() public accessLevels: string[];

  public displayedColumns: string[] = ['displayName', 'email'];
  public userList = new MatTableDataSource<UserWithAccess>();

  public selectedUser = null;

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

  coworkersSelected() {
    this.afterSelection.emit(this.selectedUser);
    this.selectedUser = null;
    (document.getElementById('user-search-bar') as HTMLInputElement).value = '';
    this.applyFilter('')

  }

  private userFilterPredicate(): (data: UserWithAccess, filter: string) => boolean {

    return (user: UserWithAccess, filter: string) =>

      // Condition for the filter
      (user.displayName !== null && filter.trim().length >= 3 &&
        user.displayName.trim().toLowerCase().includes(filter.toLowerCase()) &&
        filter.toLowerCase() !== 'v/o');

  }

  private removeCurrentUser() {

    return mergeMap((users: UserWithAccess[]) => this.authService.getCurrentUser()
      .pipe(map(currentUser => users.filter(user => user.uid !== currentUser.uid))));

  }

  selectUser(selectedUser: any) {

    this.selectedUser = selectedUser;
    (document.getElementById('user-search-bar') as HTMLInputElement).value = selectedUser.displayName;

  }
}
