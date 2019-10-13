import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators'
import { User } from '../../_interfaces/user';



@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.sass']
})
export class UserListComponent implements OnInit {

  @Output() onSelection = new EventEmitter<User[]>();

  private selection = new SelectionModel<User>(true, []);
  private displayedColumns: string[] = ['select', 'firstName', 'lastName', 'mail'];
  private userList = new MatTableDataSource<User>();

  constructor(private database: AngularFirestore) { }

  ngOnInit(): void {

    // TODO: very bad solution for get only once...
    let thisObserver = this.database.collection('users',
      collRef => collRef.where('visibility', "==", 'visible')).snapshotChanges()
      // Create new Users out of the data
      .pipe(map(docActions => docActions.map(docRef => {

        let docData = docRef.payload.doc.data();

        let user: User = {
          firstName: docData['firstName'],
          lastName: docData['lastName'],
          mail: docData['mail'],
          uid: docData['uid'],

        }
        return user;
      })))
      .subscribe((users: User[]) => {
        this.userList = new MatTableDataSource<User>(users);
        thisObserver.unsubscribe();
      })

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


  }

}
