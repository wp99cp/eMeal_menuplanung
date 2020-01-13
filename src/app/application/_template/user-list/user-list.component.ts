import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators'
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { MatSnackBar } from '@angular/material';



@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.sass']
})
export class UserListComponent implements OnInit {

  @Output() onSelection = new EventEmitter<User[]>();

  public selection = new SelectionModel<User>(true, []);
  public displayedColumns: string[] = ['select', 'displayName', 'email'];
  public userList = new MatTableDataSource<User>();

  constructor(private database: AngularFirestore, private authService: AuthenticationService, public snackBar: MatSnackBar) { }

  // TODO: Lazy load!!!!
  ngOnInit(): void {

    this.authService.getCurrentUser().subscribe(currentUser => {
      // TODO: very bad solution for get only once...
      const thisObserver = this.database.collection('users',
        collRef => collRef.where('visibility', '==', 'visible')).snapshotChanges()
        // Create new Users out of the data
        .pipe(map(docActions => docActions.map(docRef => {

          const docData: any = docRef.payload.doc.data();

          const user: User = {
            displayName: docData.displayName,
            email: docData.email,
            uid: docRef.payload.doc.id
          };

          return user;
        })))
        .subscribe((users: User[]) => {

          this.userList = new MatTableDataSource<User>(users.filter(user => user.uid !== currentUser.uid));
          thisObserver.unsubscribe();

        });

    });
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
  checkboxLabel(user?: User): string {
    if (!user) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(user) ? 'deselect' : 'select'} row ${user.uid}`;
  }

  coworkersSelected() {
    this.onSelection.emit(this.selection.selected);
    this.selection.clear();
    this.snackBar.open('Ausgewählte Nutzer wurden hinzugefügt.', '', { duration: 2000 });


  }

}
