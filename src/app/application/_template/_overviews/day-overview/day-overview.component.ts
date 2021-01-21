import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {SwissDateAdapter} from 'src/app/utils/format-datapicker';

import {Day} from '../../../_class/day';
import {SpecificMeal} from '../../../_class/specific-meal';
import {EditDayComponent} from '../../../_dialoges/edit-day/edit-day.component';
import {MatDialog} from '@angular/material/dialog';
import {ContextMenuNode, ContextMenuService} from '../../../_service/context-menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HelpService} from '../../../_service/help.service';

@Component({
  selector: 'app-day-overview',
  templateUrl: './day-overview.component.html',
  styleUrls: ['./day-overview.component.sass']
})
export class DayOverviewComponent implements OnChanges {
  @Input() access: boolean;
  // gleichzeitig gelöscht wird!) Beheben analog zu tile_page class....
  @Input() day: Day;

  // TODO: z.T. beim Löschen doppelte Mahlzeiten (sie tauchen wieder auf, falls eine zweite Mahlzeit
  @Input() specificMeals: SpecificMeal[];
  @Input() days: Day[];
  @Input() hideIcons = false;
  @Output() mealDropped = new EventEmitter<[SpecificMeal, CdkDragDrop<any, any>]>();
  @Output() mealDeleted = new EventEmitter<[string, string]>();
  @Output() dayEdited = new EventEmitter<[number, Day, SpecificMeal[]]>();
  @Output() addMeal = new EventEmitter<Day>();
  public hidden = false;
  public warning: string;

  constructor(public dialog: MatDialog,
              public swissDateAdapter: SwissDateAdapter,
              private contextMenuService: ContextMenuService,
              private router: Router,
              private activeRoute: ActivatedRoute,
              private helpService: HelpService) {
  }

  getMealNames(){

    return ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten'];

  }

  setContextMenu() {


    setTimeout(() => {
      if (this.specificMeals === null) {
        return;
      }

      this.specificMeals.forEach(meal => {

        const element = document.getElementById(meal.documentId);

        if (element === null || element === undefined) {
          return;
        }

        const node: ContextMenuNode = {
          node: element as HTMLElement,
          contextMenuEntries: [
            {
              icon: 'edit',
              name: 'Bearbeiten',
              shortCut: '',
              function: (event) => this.router.navigate([`meals/${meal.getMealId()}/${meal.documentId}`],
                {relativeTo: this.activeRoute})
            },
            {
              icon: 'delete',
              name: 'Mahlzeit Löschen',
              shortCut: '',
              function: (event) => this.mealDeleted.emit([meal.getMealId(), meal.documentId])
            },
            'Separator',
            {
              icon: 'help',
              name: 'Hilfe / Erklärungen',
              shortCut: 'F1',
              function: (event) => this.helpService.openHelpPopup()
            }
          ]
        };
        this.contextMenuService.addContextMenuNode(node);

      });
    }, 200);

  }

  log(str) {

    console.log(str);

  }

  ngOnChanges() {

    // Sortiert die Mahlzeiten
    this.warning = '';

    this.sortMeals();

    this.setContextMenu()

  }

  /**
   *
   */
  public visible(specificMealId: string) {

    if (document.getElementById(specificMealId)) {

      return !document.getElementById(specificMealId).classList.contains('hidden');

    }

    return true;

  }

  addNewMeal(day: Day) {

    this.addMeal.emit(day);

  }

  /**
   * Berbeite einen Tag.
   *
   * Öffnet den entsprechenden
   *
   */
  editDay(day: Day) {


    this.dialog
      .open(EditDayComponent, {
        height: '618px',
        width: '1000px',
        data: {day, specificMeals: this.specificMeals, days: this.days, access: this.access}
      })
      .afterClosed()
      .subscribe((save: number) => {

        this.dayEdited.emit([save, this.day, this.specificMeals]);

      });

  }

  /**
   * Sortiert die Mahlzeiten
   *
   * @param pluralOfMahlzeiten
   * @param orderOfMahlzeiten
   */
  sortMeals() {

    const orderOfMahlzeiten = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack'];
    const pluralOfMahlzeiten = ['Zmorgen', 'Znüni\'s', 'Zmittage', 'Zvieri\'s', 'Znacht\'s', 'Leitersnack\'s'];

    if (this.specificMeals == null) {
      return;
    }

    this.specificMeals.sort((a, b) => {

      if (a.usedAs === b.usedAs) {
        this.warning = 'Achtung mehrere ' + pluralOfMahlzeiten[orderOfMahlzeiten.indexOf(a.usedAs)] + '!';
      }
      return orderOfMahlzeiten.indexOf(a.usedAs) - orderOfMahlzeiten.indexOf(b.usedAs);

    });

  }


  getMinHeight(nameOfMeal: string) {

    const heights = {
      Zmorgen: 60,
      Znüni: 12,
      Zmittag: 60,
      Zvieri: 12,
      Znacht: 60,
      Leitersnack: 12,
      Vorbereiten: 12,
    };

    return heights[nameOfMeal];

  }
}
