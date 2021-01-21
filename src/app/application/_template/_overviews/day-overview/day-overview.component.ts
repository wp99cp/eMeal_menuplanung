import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {SwissDateAdapter} from 'src/app/utils/format-datapicker';

import {Day} from '../../../_class/day';
import {SpecificMeal} from '../../../_class/specific-meal';
import {EditDayComponent} from '../../../_dialoges/edit-day/edit-day.component';
import {MatDialog} from '@angular/material/dialog';
import {ContextMenuNode, ContextMenuService} from '../../../_service/context-menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HelpService} from '../../../_service/help.service';
import {MealUsage} from '../../../_interfaces/firestoreDatatypes';

@Component({
  selector: 'app-day-overview',
  templateUrl: './day-overview.component.html',
  styleUrls: ['./day-overview.component.sass'],

})
export class DayOverviewComponent implements OnChanges, OnInit {
  @Input() access: boolean;
  // gleichzeitig gelöscht wird!) Beheben analog zu tile_page class....
  @Input() day: Day;
  @Input() mealsToPrepare: SpecificMeal[];
  @Input() specificMeals: SpecificMeal[];
  @Input() days: Day[];
  @Input() hideIcons = false;
  @Output() mealDropped = new EventEmitter<[SpecificMeal, MealUsage, string]>();
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

  getMeal(name: string) {

    if (name === 'Vorbereiten') {
      return this.mealsToPrepare;
    }

    return this.specificMeals?.filter(meal => meal.usedAs === name);

  }

  getMealNames() {

    return ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten'];

  }

  setContextMenu() {


    setTimeout(() => {

      if (this.specificMeals === null) {
        return;
      }

      const empties = document.querySelectorAll('[data-add-note="true"]');

      empties.forEach(empty => {

        const node: ContextMenuNode = {
          node: empty.parentElement as HTMLElement,
          contextMenuEntries: [
            {
              icon: 'add',
              name: 'Hinzufügen',
              shortCut: '',
              function: (event) => this.addMeal.emit(this.day)
            },
            {
              icon: 'sticky_note_2',
              name: 'Notiz einfügen',
              shortCut: '',
              function: (event) => {
              }
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

      this.specificMeals.forEach(meal => {

        const elements = document.querySelectorAll('[data-meal-id=' + meal.documentId + ']');

        if (elements === null || elements === undefined) {
          return;
        }

        elements.forEach(element => {

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
      });
    }, 200);

  }


  ngOnChanges() {

    this.warning = '';
    this.setContextMenu();
    this.mealsToPrepare =
      this.mealsToPrepare?.filter(meal => meal.prepareAsDate.getTime() === this.day.dateAsTypeDate.getTime());

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


  mealDroppedAction([meal, event]: [SpecificMeal, CdkDragDrop<any, any>]) {


    event.item.element.nativeElement.style.visibility = 'hidden';

    const mealUsage: MealUsage =
      event.container.element.nativeElement.getAttribute('data-meal-name') as MealUsage;
    const mealDateString = event.container.element.nativeElement.parentElement.id;

    console.log(event.container.element.nativeElement);

    this.mealDropped.emit([meal, mealUsage, mealDateString]);

  }

  ngOnInit(): void {
  }


}
