import {Component, Input, OnChanges} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {User} from '../../classes/user';
import {AccessData} from '../../interfaces/firestoreDatatypes';
import {DatabaseService} from '../../services/database.service';

@Component({
  selector: 'app-list-of-user-with-access',
  templateUrl: './list-of-users.component.html',
  styleUrls: ['./list-of-users.component.sass']
})
export class ListOfUsersComponent implements OnChanges {

  @Input() public accessLevels: string[];
  @Input() userList: AccessData;

  public users: Observable<User[]>;

  constructor(private dbService: DatabaseService) {
  }


  ngOnChanges() {

    if (this.userList != null) {

      // creates an alphabetically sorted list of the users
      this.users = this.dbService.getUsers(this.userList)
        .pipe(map(results =>
          results.sort((a, b) => a.displayName.localeCompare(b.displayName))
        ));

    }

  }

  remove(user: User) {

    if (this.userList[user.uid] === 'owner') {
      return;
    }

    delete this.userList[user.uid];
    this.ngOnChanges();

  }
}
