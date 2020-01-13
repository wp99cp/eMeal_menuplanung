import { Component, OnInit, Input, AfterViewInit, OnChanges } from '@angular/core';
import { AccessData } from '../../_interfaces/accessData';
import { Observable } from 'rxjs';
import { DatabaseService } from '../../_service/database.service';
import { User } from '../../_interfaces/user';
import { mergeMap } from 'rxjs/operators';

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

      this.owners = this.dbService.getUsers(this.userList);

    }

  }

}
