import {Component, Inject} from '@angular/core';
import {DatabaseService} from '../../_service/database.service';
import {UserWithAccess} from '../../_template/add-new-user/add-new-user.component';
import {AccessData} from '../../_interfaces/firestoreDatatypes';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HelpService} from '../../_service/help.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.sass']
})
export class ShareDialogComponent {

  public accessData: AccessData;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      objectName: string;
      currentAccess: AccessData;
      documentPath: string;
      accessLevels: string[];
    },
    public helpService: HelpService,
    private databaseService: DatabaseService,
    public snackBar: MatSnackBar) {

    this.accessData = data.currentAccess;
  }

  /** A user get selected */
  selectUser(user: UserWithAccess) {

    const newAccess: AccessData = this.data.currentAccess;

    console.log(user.displayName + ' ' + user.accessLevel);

    const oldAccessLevel = newAccess[user.uid];

    // upgrade level if possible
    if (oldAccessLevel) {

      if (oldAccessLevel === 'editor' && user.accessLevel === 'owner') {
        newAccess[user.uid] = user.accessLevel;
      }

      if (oldAccessLevel === 'collaborator' && (user.accessLevel === 'owner' || user.accessLevel === 'editor')) {
        newAccess[user.uid] = user.accessLevel;
      }

      if (oldAccessLevel === 'viewer' && (user.accessLevel === 'collaborator' || user.accessLevel === 'editor' || user.accessLevel === 'owner')) {
        newAccess[user.uid] = user.accessLevel;
      }

    } else {
      newAccess[user.uid] = user.accessLevel;
    }

    // need to creat a new object, such that the changes get detected by the list-of-user module
    this.accessData = JSON.parse(JSON.stringify(newAccess));

  }

  saveValueChanges() {

    console.log(this.accessData);
    this.databaseService.updateAccessData(this.accessData, this.data.documentPath).subscribe(message => {
      console.log(message);
      this.snackBar.open(message.message ? message.message : message.error, '', {duration: 3500});
    });

  }

}
