import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';
import { DatabaseService } from '../_service/database.service';
import { Observable } from 'rxjs';
import { User } from '../_interfaces/user';

@Component({
  selector: 'app-welcom-page',
  templateUrl: './welcom-page.component.html',
  styleUrls: ['./welcom-page.component.sass']
})
export class WelcomPageComponent implements OnInit {

  private currentUser: Observable<User>;

  constructor(public databaseService: DatabaseService, public auth: AuthenticationService) { }

  ngOnInit() {

    this.currentUser = this.auth.getCurrentUser();
    this.currentUser.subscribe(console.log)

  }



}
