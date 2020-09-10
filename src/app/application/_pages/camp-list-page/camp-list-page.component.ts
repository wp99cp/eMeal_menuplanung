import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable} from 'rxjs';
import {mergeMap, take} from 'rxjs/operators';
import {Camp} from '../../_class/camp';
import {CopyCampComponent} from '../../_dialoges/copy-camp/copy-camp.component';
import {CreateCampComponent} from '../../_dialoges/create-camp/create-camp.component';
import {DeleteCampComponent} from '../../_dialoges/delete-camp/delete-camp.component';
import {FirestoreCamp} from '../../_interfaces/firestoreDatatypes';
import {DatabaseService} from '../../_service/database.service';
import {TileListPage} from '../tile_page';
import {MatSnackBar} from '@angular/material/snack-bar';
import {HelpService} from '../../_service/help.service';

/**
 * CampListPageComponent
 *
 * Page with a list of all editableCamps
 *
 */
@Component({
  selector: 'app-camp-list-page',
  templateUrl: './camp-list-page.component.html',
  styleUrls: ['./camp-list-page.component.sass']
})
export class CampListPageComponent extends TileListPage<Camp> implements OnInit {

  constructor(
    public dialog: MatDialog,
    public dbService: DatabaseService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    router: Router,
    helpService: HelpService) {

    super(dbService, snackBar, dbService.getCampsWithAccess(), dialog, helpService, router);

    // set filter for searching
    this.filterFn = (camp: Camp) =>
      camp.name.toLocaleLowerCase().includes(this.filterValue.toLocaleLowerCase()) ||
      camp.year.toLocaleLowerCase().includes(this.filterValue.toLocaleLowerCase());

    // set name of Type
    this.dbElementName = 'Lager';

  }

  newElement() {

    this.dialog.open(CreateCampComponent, {
      height: '640px',
      width: '900px',
      data: {campName: ''}
    }).afterClosed()
      .pipe(
        mergeMap((camp: Observable<FirestoreCamp>) => camp),
        take(1))
      .subscribe(campData => this.dbService.addDocument(campData, 'camps'));

  }

  copy(event: any) {

    this.dialog.open(CopyCampComponent, {
      width: '530px',
      height: '250px',
    }).afterClosed().pipe(take(1))
      .subscribe(async () => {


      });


  }

  // no special condition
  async deleteConditions(camp: Camp): Promise<boolean> {

    if (!await this.dbService.isOwner(camp))
      return false;

    return new Promise(resolve =>
      this.dialog.open(DeleteCampComponent, {
        width: '530px',
        height: '250px',
        data: {name: camp.name}
      }).afterClosed()
        .pipe(take(1))
        .subscribe((deleteConfirmed: boolean) => resolve(deleteConfirmed))
    );

  }


  deleteElement(camp: Camp) {


    this.dbService.deleteDocument(camp);
    this.dbService.deleteAllMealsAndRecipes(camp.documentId);

  }

  /**
   * Loads the editableCamps from the database.
   *
   */
  ngOnInit() {

    this.addButtonNew();
    this.addHelpMessage();

    setTimeout(() =>

      this.route.queryParams.subscribe(params => {

        const usesParameter = params.includes;

        if (usesParameter) {
          (document.getElementById('search-field') as HTMLFormElement).value = 'includes: ' + usesParameter;
          this.applyFilter('includes: ' + usesParameter);

        }

      }), 250);

  }


  applyFilter(event: string) {

    if (event.includes('includes:')) {

      const mealId = event.substr(event.indexOf(':') + 1).trim();
      this.dbService.getCampsThatIncludes(mealId).pipe(take(1))
        .subscribe(camps => this.filteredElements = camps);

      return;

    }

    super.applyFilter(event);

  }


}

