import {Component, Inject} from '@angular/core';
import {AuthenticationService} from '../../_service/authentication.service';
import {DatabaseService} from '../../_service/database.service';
import {UserWithAccess} from '../../_template/user-list/user-list.component';
import {AccessData} from '../../_interfaces/firestoreDatatypes';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HelpService} from "../../_service/help.service";

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.sass']
})
export class ShareDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      objectName: string;
      currentAccess: AccessData;
      documentPath: string;
      accessLevels: string[];
    },
    public helpService: HelpService,
    private databaseService: DatabaseService) {
  }


  jsonConcat(o1, o2) {
    for (const key in o2) {
      o1[key] = o2[key];
    }
    return o1;
  }

  /** A user get selected */
  selectUser(selectedCoworkers: UserWithAccess[]) {

    const newAccess: AccessData = this.data.currentAccess;

    selectedCoworkers.forEach(user => {
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

    });

    this.data.currentAccess = newAccess;
    this.databaseService.updateAccessData(newAccess, this.data.documentPath);

  }

}
