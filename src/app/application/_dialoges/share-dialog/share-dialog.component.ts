import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

import { Camp } from '../../_class/camp';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { userWithAccess } from '../../_template/user-list/user-list.component';
import { AccessData } from '../../_interfaces/firestoreDatatypes';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.sass']
})
export class ShareDialogComponent implements OnInit {

  public camp: Camp;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: { camp: Camp },
    private databaseService: DatabaseService,
    private auth: AuthenticationService, ) {

    this.camp = data.camp;

  }

  ngOnInit() {
  }

  jsonConcat(o1, o2) {
    for (const key in o2) {
      o1[key] = o2[key];
    }
    return o1;
  }

  /** A user get selected */
  selectUser(selectedCoworkers: userWithAccess[]) {

    let newAccess: AccessData = this.camp.getAccessData();
    
    selectedCoworkers.forEach(user => {
      console.log(user.displayName + " " + user.accessLevel);

      const oldAccessLevel = newAccess[user.uid];

      // upgrade level if possible
      if(oldAccessLevel){

        if(oldAccessLevel == 'editor' && user.accessLevel == 'owner'){
          newAccess[user.uid] = user.accessLevel; 
        }
        
        if(oldAccessLevel == 'collaborator' && (user.accessLevel == 'owner' || user.accessLevel == 'editor')){
          newAccess[user.uid] = user.accessLevel; 
        }

        if(oldAccessLevel == 'viewer' && (user.accessLevel == 'collaborator' || user.accessLevel == 'editor' ||  user.accessLevel == 'owner')){
          newAccess[user.uid] = user.accessLevel; 
        }

      }
      // add access
      else{
        newAccess[user.uid] = user.accessLevel; 
      }

    });

    this.databaseService.updateAccessData(newAccess, this.camp.path)
    
  }

}
