import { Component, Input, OnChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../../_class/user';
import { AccessData } from '../../_interfaces/firestoreDatatypes';
import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-list-of-users',
  templateUrl: './list-of-users.component.html',
  styleUrls: ['./list-of-users.component.sass']
})
export class ListOfUsersComponent implements OnChanges {

  @Input() userList: AccessData;

  public owners: Observable<User[]>;

  constructor(private dbService: DatabaseService) { }

  ngOnChanges() {

    if (this.userList != null) {

      // creates an alphabetically sorted list of the users
      this.owners = this.dbService.getUsers(this.userList)
        .pipe(map(results => results.sort((a, b) => a.displayName.localeCompare(b.displayName))));

    }

  }

}
