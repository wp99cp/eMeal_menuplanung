import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {Observable} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import packageJSON from '../../../../../../package.json';
import {User} from '../../classes/user.js';
import {AuthenticationService} from '../../services/authentication.service';
import {DatabaseService} from '../../services/database.service';
import {SettingsService} from '../../services/settings.service';
import {HelpService} from '../../services/help.service';


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
  public version: string = packageJSON.version;
  public copyrights: string = packageJSON.copyrights;

  public userDataForm: FormGroup;

  constructor(private auth: AuthenticationService,
              private dbService: DatabaseService,
              formBuilder: FormBuilder,
              public settings: SettingsService,
              public help: HelpService) {

    this.userDataForm = formBuilder.group({displayName: '', visibility: 'hidden'});

    this.user = this.loadAndSetUserData();
    this.user.subscribe(user => {

      // setzt die FormValues
      this.userDataForm.setValue({
        displayName: user.displayName,
        visibility: user.visibility
      });

    });

  }

  public visibilityChanged(visibility: string) {

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

  changeIncludeTemplates(value: string) {

    this.settings.globalSettings.pipe(take(1)).subscribe(settings => {
      settings.show_templates = (value === 'true');
      this.dbService.updateSettings(settings).then(console.log);
    });

  }

  changeDefaultParticipants(value: string) {
    this.settings.globalSettings.pipe(take(1)).subscribe(settings => {
      settings.default_participants = parseInt(value, 10);
      this.dbService.updateSettings(settings).then(console.log);
    });

  }

  /**
   * Ladet den aktuellen Benutzer
   */
  private loadAndSetUserData() {

    return this.auth.getCurrentUser()
      .pipe(mergeMap(user => this.dbService.getUserById(user.uid)));

  }

  changeExpFeatures(value: any) {

    this.settings.globalSettings.pipe(take(1)).subscribe(settings => {
      settings.experimental_features = value;
      this.dbService.updateSettings(settings).then(console.log);
    });

  }
}
