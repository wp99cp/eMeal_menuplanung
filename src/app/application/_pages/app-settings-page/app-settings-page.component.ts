import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { mergeMap, take } from 'rxjs/operators';
import { copyrights, version as softwareVersion } from '../../../../../package.json';
import { User } from '../../_class/user.js';
import { AuthenticationService } from '../../_service/authentication.service';
import { DatabaseService } from '../../_service/database.service';



@Component({
  selector: 'app-app-settings-page',
  templateUrl: './app-settings-page.component.html',
  styleUrls: ['./app-settings-page.component.sass']
})

/**
 * AppSettingsPageComponent
 *
 *
 */
export class AppSettingsPageComponent {

  public user: Observable<User>;
  public version: string = softwareVersion;
  public copyrights: string = copyrights;

  public userDataForm: FormGroup;

  constructor(private auth: AuthenticationService, private dbService: DatabaseService, formBuilder: FormBuilder) {

    this.userDataForm = formBuilder.group({ displayName: '', visibility: 'hidden' });

    this.user = this.loadAndSetUserData();
    this.user.subscribe(user => {

      // setzt die FormValues
      this.userDataForm.setValue({
        displayName: user.displayName,
        visibility: user.visibility
      });

    });

  }

  /**
   * Ladet den aktuellen Benutzer
   */
  private loadAndSetUserData() {

    return this.auth.getCurrentUser()
      .pipe(mergeMap(user => this.dbService.getUserById(user.uid)));

  }


  public visibilityChanged(visibility: 'hidden' | 'visible') {

    this.userDataForm.value.visibility = visibility;
    this.userDataForm.markAsTouched();

  }

  /**
   * Speichert die geänderten Benutzerdaten.
   *
   */
  public updateUserData() {

    this.user.pipe(take(1))
      .subscribe(user => {

        user.displayName = this.userDataForm.value.displayName;
        user.visibility = this.userDataForm.value.visibility;

        this.dbService.updateDocument(user);

      });

  }

}
