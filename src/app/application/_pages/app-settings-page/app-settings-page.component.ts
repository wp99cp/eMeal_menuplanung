import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { copyrights, version as softwareVersion } from '../../../../../package.json';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-app-settings-page',
  templateUrl: './app-settings-page.component.html',
  styleUrls: ['./app-settings-page.component.sass']
})
export class AppSettingsPageComponent {

  public user: Observable<User>;
  public version: string = softwareVersion;
  public copyrights: string = copyrights;

  public userDataForm: FormGroup;

  constructor(auth: AuthenticationService, private dbService: DatabaseService, formBuilder: FormBuilder) {

    this.setHeaderInfo();

    this.loadAndSetUserData(auth, dbService, formBuilder);

  }

  private loadAndSetUserData(auth: AuthenticationService, dbService: DatabaseService, formBuilder: FormBuilder) {

    this.user = auth.getCurrentUser().pipe(mergeMap(user => dbService.getUserById(user.uid)));
    this.user.subscribe(user => {
      this.userDataForm = formBuilder.group({
        displayName: user.displayName,
        visibility: user.visibility
      });
    });

  }


  public visibilityChanged(visibility: 'hidden' | 'visible') {

    this.userDataForm.value.visibility = visibility;
    this.userDataForm.markAsTouched();

  }

  private setHeaderInfo(): void {

    Header.title = 'Einstellungen';
    Header.path = ['Startseite', 'Einstellungen'];

  }

  /**
   * Speichert die geänderten Benutzerdaten
   */
  public updateUserData() {

    this.user.subscribe(user => this.dbService.updateUser(this.userDataForm.value, user.uid));

  }

}
