import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';
import { mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../../_interfaces/user';
import { version as softwareVersion } from '../../../../../package.json';
import { copyrights } from '../../../../../package.json';

import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

@Component({
  selector: 'app-app-settings-page',
  templateUrl: './app-settings-page.component.html',
  styleUrls: ['./app-settings-page.component.sass']
})
export class AppSettingsPageComponent implements OnInit {

  public user: Observable<User>;
  public version: string = softwareVersion;
  public copyrights: string = copyrights;

  constructor(auth: AuthenticationService, dbService: DatabaseService) {

    this.setHeaderInfo();
    this.user = auth.getCurrentUser().pipe(mergeMap(user => dbService.getUserById(user.uid)));

  }

  ngOnInit() {
  }

  private setHeaderInfo(): void {

    Header.title = 'Einstellungen';
    Header.path = ['Startseite', 'Einstellungen'];

  }

}
