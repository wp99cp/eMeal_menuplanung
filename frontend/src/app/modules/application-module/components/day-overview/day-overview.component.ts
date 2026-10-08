import {CdkDrag, CdkDragDrop, CdkDragStart, CdkDropList} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild} from '@angular/core';

import {Day} from '../../classes/day';
import {SpecificMeal} from '../../classes/specific-meal';
import {EditDayComponent} from '../../dialoges/edit-day/edit-day.component';
import {MatDialog} from '@angular/material/dialog';
import {ContextMenuNode, ContextMenuService} from '../../services/context-menu.service';
import {ActivatedRoute, Router} from '@angular/router';
import {HelpService} from '../../services/help.service';
import {MealUsage} from '../../interfaces/firestoreDatatypes';
import {MatSnackBar} from '@angular/material/snack-bar';
import {BehaviorSubject, combineLatest, Observable, of, Subscription} from 'rxjs';
import {filter, take} from 'rxjs/operators';
import {DatabaseService} from '../../services/database.service';
import {SwissDateAdapter} from '../../../../shared/utils/format-datapicker';

/**
 * A place for a meal on a day, e.g. the "Zmittag". It is the data of a drop list of the week-overview.
 */
export interface MealSlot {
  usage: MealUsage | 'Vorbereiten';
  day: Day;
  meals: SpecificMeal[];
}

@Component({
  standalone: false,
  selector: 'app-day-overview',
  templateUrl: './day-overview.component.html',
  styleUrls: ['./day-overview.component.sass'],

})
export class DayOverviewComponent implements OnChanges, OnDestroy {

  @Input() access: boolean;
  @Input() day: Day;
  @Input() mealsToPrepare: Observable<SpecificMeal[]>;
  @Input() specificMeals: Observable<SpecificMeal[]>;
  @Input() days: Day[];
  @Input() hideIcons = false;

  @Output() mealDropped = new EventEmitter<[SpecificMeal, MealUsage, string]>();
  @Output() mealDeleted = new EventEmitter<[string, string]>();
  @Output() dayEdited = new EventEmitter<[number, Day, SpecificMeal[]]>();
  @Output() addMeal = new EventEmitter<[Day, MealUsage]>();

  @ViewChild('dayElement') dayElement;

  public hidden = false;
  public warning: string;

  /** The places for the meals of this day with the meals as they are shown, undefined until the meals are loaded. */
  public slots: MealSlot[];

  /** Number of reasons why the meals of all days currently stay as they are shown, see holdUpdates(). */
  private static readonly updatesOnHold = new BehaviorSubject(0);

  private mealsSubscription: Subscription;
  private shownMeals: SpecificMeal[];
  private releaseDrag: () => void;

  constructor(public dialog: MatDialog,
              public swissDateAdapter: SwissDateAdapter,
              private contextMenuService: ContextMenuService,
              private router: Router,
              private activeRoute: ActivatedRoute,
              private helpService: HelpService,
              private snackBar: MatSnackBar,
              private dbService: DatabaseService) {
  }

  /**
   * Keeps the meals of all days as they are shown until the returned function gets called. Afterwards the days
   * show the current state of the database again.
   *
   * This is used while a meal is dragged and while a move is written to the database. An update of the database
   * in between would replace the dragged element or show the state from before the move, the former leads to an
   * ExpressionChangedAfterItHasBeenCheckedError.
   *
   * @returns: the function to call once the meals can be updated again
   */
  public static holdUpdates(): () => void {

    const onHold = DayOverviewComponent.updatesOnHold;
    let released = false;

    onHold.next(onHold.value + 1);

    return () => {
      if (!released) {
        released = true;
        onHold.next(onHold.value - 1);
      }
    };

  }

  ngOnDestroy(): void {

    this.mealsSubscription?.unsubscribe();

    // The day got removed during a drag. The other days are updated after the current change detection.
    if (this.releaseDrag) {
      Promise.resolve().then(this.releaseDrag);
    }

  }


  getMealNames(): (MealUsage | 'Vorbereiten')[] {

    return ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Dessert', 'Leitersnack', 'Vorbereiten'];

  }

  trackByMealId(index: number, meal: SpecificMeal) {

    return meal.documentId;

  }

  /**
   * Shows the meals of the database, unless the meals are on hold: then the latest ones are shown afterwards.
   */
  private loadMeals() {

    this.mealsSubscription?.unsubscribe();
    this.slots = undefined;

    if (!this.specificMeals) {
      return;
    }

    this.mealsSubscription = combineLatest([
      this.specificMeals,
      this.mealsToPrepare ?? of([] as SpecificMeal[]),
      DayOverviewComponent.updatesOnHold
    ])
      .pipe(filter(([, , updatesOnHold]) => updatesOnHold === 0))
      .subscribe(([meals, mealsToPrepare]) => this.showMeals(meals, mealsToPrepare));

  }

  private showMeals(meals: SpecificMeal[], mealsToPrepare: SpecificMeal[]) {

    this.slots = this.slots ?? this.getMealNames().map(usage => ({usage, day: this.day, meals: []}));

    this.slots.forEach(slot => slot.meals = slot.usage === 'Vorbereiten' ?
      mealsToPrepare.filter(meal => meal.prepareAsDate.getTime() === this.day.dateAsTypeDate.getTime()) :
      meals.filter(meal => meal.usedAs === slot.usage));

    // the elements of new meals need a context menu
    if (this.shownMeals !== meals) {
      this.shownMeals = meals;
      this.setContextMenu();
    }

  }

  setContextMenu(includeLateChanges = true) {

    if (includeLateChanges) {
      setTimeout(() => this.setContextMenu(false), 250);
    }

    if (this.specificMeals === null) {
      return;
    }


    const empties = this.dayElement?.nativeElement.querySelectorAll('[data-add-note="true"]');

    // TODO: including this leads to performance issues
    /*
    if (empties === undefined || empties.length === 0) {
      setTimeout(() => {
        console.log("setContextMenu_timeout2");
        this.setContextMenu();
      }, 250);
      return;
    }
    */


    // the view is not rendered yet
    if (empties === undefined) {
      return;
    }

    empties.forEach(empty => {

      const node: ContextMenuNode = {
        node: empty as HTMLElement,
        contextMenuEntries: [
          {
            icon: 'add',
            name: 'Hinzufügen',
            shortCut: '',
            disabled: !(empty as HTMLElement).classList.contains('meal-addable'),
            function: () => this.addMeal.emit([this.day, empty.parentElement.getAttribute('data-meal-name')])
          },
          {
            icon: 'sticky_note_2',
            name: 'Notiz einfügen',
            shortCut: '',
            disabled: true,
            function: () => {
              this.snackBar.open('Notizen können zur Zeit nicht hinzugefügt werden!', '', {duration: 2000});
            }
          },
          'Separator',
          {
            icon: 'help',
            name: 'Hilfe / Erklärungen',
            shortCut: 'F1',
            function: () => this.helpService.openHelpPopup()
          }
        ]
      };

      this.contextMenuService.addContextMenuNode(node);

    });

    this.shownMeals?.forEach(meal => {

      const elements = document.querySelectorAll('[data-meal-id=ID-' + meal.documentId + ']');

      if (elements === null || elements === undefined) {
        return;
      }

      elements.forEach(element => {

        if (element.parentElement.nodeName !== 'BODY') {

          const node: ContextMenuNode = {
            node: element as HTMLElement,
            contextMenuEntries: [
              {
                icon: 'edit',
                name: 'Bearbeiten',
                shortCut: '',
                function: () => this.router.navigate([`meals/${meal.getMealId()}/${meal.documentId}`],
                  {relativeTo: this.activeRoute})
              },
              {
                icon: 'delete',
                name: 'Mahlzeit entfernen',
                shortCut: '',
                function: () => this.mealDeleted.emit([meal.getMealId(), meal.documentId])
              },
              'Separator'
            ]
          };

          if (((element as HTMLElement).parentElement.parentElement).classList.contains('Vorbereiten')) {
            node.contextMenuEntries.push({
              icon: 'av_timer',
              name: 'Vorbereiten Löschen',
              shortCut: '',
              function: () => this.removePrepareDate(meal)
            });
            node.contextMenuEntries.push('Separator');
          }

          node.contextMenuEntries.push({
            icon: 'help',
            name: 'Hilfe / Erklärungen',
            shortCut: 'F1',
            function: () => this.helpService.openHelpPopup()
          });

          this.contextMenuService.addContextMenuNode(node);
        }
      });
    });

  }


  ngOnChanges(changes: SimpleChanges) {

    this.warning = '';
    this.setContextMenu();

    if (changes.day || changes.specificMeals || changes.mealsToPrepare) {
      this.loadMeals();
    }

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


  /**
   * Berbeite einen Tag.
   *
   * Öffnet den entsprechenden
   *
   */
  editDay(day: Day) {

    this.specificMeals.pipe(take(1)).subscribe(meals => {

      this.dialog
        .open(EditDayComponent, {
          height: '618px',
          width: '1000px',
          data: {day, specificMeals: meals, days: this.days, access: this.access}
        })
        .afterClosed()
        .subscribe((save: number) => {

          this.dayEdited.emit([save, this.day, meals]);

        });
    });

  }


  /**
   * Action executed after a meal has been dropped, i.g. at the end of every drag.
   */
  mealDroppedAction(event: CdkDragDrop<MealSlot, MealSlot, SpecificMeal>) {

    try {

      const meal = event.item.data;
      const oldSlot = event.previousContainer.data;
      const newSlot = event.container.data;

      // Don't update the model, if the meal has not been moved to another location.
      if (newSlot === oldSlot) {
        return;
      }

      if (newSlot.usage === 'Vorbereiten') {
        this.snackBar
          .open('Mahlzeit konnte nicht verschoben werden. Erfahre, wie du Mahlzeiten vorbereiten kannst.', 'Hilfe', {duration: 2500})
          .onAction().subscribe(() => {
          this.helpService.openHelpPopup('mahlzeit-vorbereiten')
        });
        return;
      }

      // Move the meal in the view. The parent holds the updates until the move is written, so the meal does not
      // jump back to its old place in between.
      oldSlot.meals.splice(oldSlot.meals.indexOf(meal), 1);
      newSlot.meals.push(meal);

      // Move the meal in the model
      this.mealDropped.emit([meal, newSlot.usage, String(newSlot.day.getTimestamp().toMillis())]);

    } finally {

      this.releaseDrag?.();
      this.releaseDrag = undefined;

    }

  }


  predicate(drag: CdkDrag, drop: CdkDropList<MealSlot>): boolean {

    return drop.data.meals.length === 0;

  }

  dragStarted(event: CdkDragStart) {

    this.releaseDrag = DayOverviewComponent.holdUpdates();

    document.querySelectorAll('.has-a-meal, .Vorbereiten').forEach(el => {
      if (el !== event.source.dropContainer.element.nativeElement) {
        el.classList.add('block-drop');
      } else {
        el.classList.add('home-field');
      }
    });


  }

  dragStopped(event: CdkDragStart) {

    document.querySelectorAll('.has-a-meal, .Vorbereiten').forEach(el => {
      if (el !== event.source.dropContainer.element.nativeElement) {
        el.classList.remove('block-drop');
      } else {
        el.classList.remove('home-field');
      }
    });

    document.querySelectorAll('.block-drop').forEach(el =>
      el.classList.remove('block-drop'));

  }

  addMealToUsage(emit: [Day, string]) {
    this.addMeal.emit(emit as [Day, MealUsage]);
  }

  private removePrepareDate(meal: SpecificMeal) {

    meal.prepare = false;
    this.dbService.updateDocument(meal);

  }
}
