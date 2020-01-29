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
import { MatDialog, MatSnackBar } from '@angular/material';
import { ShareDialogComponent } from '../../_dialoges/share-dialog/share-dialog.component';
import { HeaderNavComponent } from 'src/app/_template/header-nav/header-nav.component';
import { CampInfoComponent } from '../../_dialoges/camp-info/camp-info.component';

@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit, Saveable {

  @ViewChildren(WeekViewComponent) weekViews: QueryList<WeekViewComponent>;


  // camp Data from server
  public camp: Observable<Camp>;


  // local changes to the camp data (not sync with server)
  constructor(
    private route: ActivatedRoute,
    private databaseService: DatabaseService,
    private auth: AuthenticationService,
    private router: Router,
    public dialog: MatDialog,
    public snackBar: MatSnackBar) {


    this.camp = this.route.url.pipe(mergeMap(
      url => this.databaseService.getCampById(url[1].path)
    ));

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
      active: true,
      description: 'Informationen zum Lager',
      name: 'Info',
      action: (() => this.campInfoDialog()),
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


  // save on destroy
  public async save(): Promise<boolean> {

    let saved = false;

    // saveChilds

    // TODO: diese Lösung funktioiert noch nicht....
    this.weekViews.forEach(async weekView => {
      saved = await weekView.save();
    });

    return saved;

  }


  public campInfoDialog() {

    this.camp
      .pipe(take(1))
      .pipe(mergeMap(camp =>
        this.dialog.open(CampInfoComponent, {
          height: '618px',
          width: '1000px',
          data: { camp }
        }).afterClosed()
      ))
      .subscribe((camp: Camp | null) => {
        if (camp !== null) {
          this.saveCamp(camp);
        }
      });

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

    this.databaseService.updateDocument(camp.extractDataToJSON(), camp.getDocPath());

    this.snackBar.open('Änderungen wurden gespeichert!', '', { duration: 2000 });

  }

}
