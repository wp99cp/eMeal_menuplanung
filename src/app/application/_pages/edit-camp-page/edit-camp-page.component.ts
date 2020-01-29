import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap, map, last, take } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { Camp } from '../../_class/camp';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { WeekViewComponent } from '../../_template/week-view/week-view.component';
import { AuthenticationService } from '../../_service/authentication.service';
import { Meal } from '../../_class/meal';
import { Recipe } from '../../_class/recipe';
import { MatDialog } from '@angular/material';
import { ShareDialogComponent } from '../../_dialoges/share-dialog/share-dialog.component';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';

@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit, Saveable {

  @ViewChildren(WeekViewComponent) weekViews: QueryList<WeekViewComponent>;

  // Toggle for saveButton
  public campInfosForm: FormGroup;

  // camp Data from server
  public camp: Observable<Camp>;


  // local changes to the camp data (not sync with server)
  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private router: Router,
    public dialog: MatDialog) {

    this.campInfosForm = this.formBuilder.group({
      name: '',
      description: '',
      participants: '',
      vegetarier: ''
    });


    this.camp = this.route.url.pipe(mergeMap(
      url => this.databaseService.getCampById(url[1].path)
    ));

    this.camp.subscribe(camp => this.setHeaderInfo(camp));

    // update Values
    this.camp.subscribe(camp =>
      this.campInfosForm.setValue({
        name: camp.name,
        description: camp.description,
        participants: camp.participants,
        vegetarier: camp.vegetarier ? camp.vegetarier : 0
      })


    );

  }




  ngOnInit() {

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Änderungen Speichern',
      name: 'Speichern',
      action: null,
      icon: 'save'
    });

    HeaderNavComponent.addToHeaderNav({
      active: false,
      description: 'Informationen zum Lager',
      name: 'Info',
      action: (() => null),
      icon: 'info'
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Mitarbeiter verwalten',
      name: 'Mitarbeiter',
      action: (() => this.shareDialog()),
      icon: 'group_add'
    });

    HeaderNavComponent.addToHeaderNav({
      active: true,
      description: 'Lager exportieren',
      name: 'Export',
      action: (() => this.router.navigate(['export-2'], { relativeTo: this.route })),
      icon: 'cloud_download'
    });

  }


  public campSettings() {

    console.log('campSettings');

  }


  // save on destroy
  public async save(): Promise<boolean> {

    let saved = false;

    // saveChilds

    // TODO: diese Lösung funktioiert noch nicht....
    this.weekViews.forEach(async weekView => {
      saved = await weekView.save();
    });

    if (this.campInfosForm.touched) {
      console.log('Autosave Camp');
      this.camp.subscribe(camp => this.saveCamp(camp));
      saved = true;
    }

    return saved;


  }

  private setHeaderInfo(camp: Camp): void {

    Header.title = camp.name;
    Header.path = ['Startseite', 'meine Lager', camp.name];

  }

  public shareDialog() {

    this.camp
      .pipe(take(1))
      .pipe(mergeMap(camp =>
        this.dialog.open(ShareDialogComponent, {
          height: '618px',
          width: '1000px',
          data: { camp }
        }).afterClosed()
      ))
      .subscribe((camp) => this.saveCamp(camp));

  }

  /** Save and reset the form */
  public saveCamp(camp: Camp) {

    this.saveValueChanges(camp);
    this.databaseService.updateDocument(camp.extractDataToJSON(), camp.getDocPath());

    // deactivate save button
    this.campInfosForm.markAsUntouched();

  }

  /** saved the changed values form the form */
  private saveValueChanges(camp: Camp) {
    camp.name = this.campInfosForm.value.name;
    camp.description = this.campInfosForm.value.description;
    camp.participants = this.campInfosForm.value.participants;
    camp.vegetarier = this.campInfosForm.value.vegetarier;
  }

  /** A user get selected */
  selectUser(selectedCoworkers) {

    this.auth.getCurrentUser().pipe(map(user => {
      const accessData = Camp.generateCoworkersList(user.uid, selectedCoworkers);
      accessData[user.uid] = 'owner';
      return accessData;
    })).subscribe(access => this.camp.subscribe(camp => {
      this.databaseService.updateAccessData(access, Camp.getPath(camp.firestoreElementId));
      camp.days.forEach(day => day.meals.forEach(meal => {
        this.databaseService.updateAccessData(access, Meal.getPath(meal.firestoreElementId));

        this.databaseService.getRecipes(meal.firestoreElementId).subscribe(recipes =>
          recipes.forEach(recipe =>
            this.databaseService.updateAccessData(access, Recipe.getPath(meal.firestoreElementId, recipe.firestoreElementId))
          ));

      }));

    }));

  }

}
