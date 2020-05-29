import {CdkDragDrop} from '@angular/cdk/drag-drop';
import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {SwissDateAdapter} from 'src/app/utils/format-datapicker';

import {Day} from '../../_class/day';
import {SpecificMeal} from '../../_class/specific-meal';
import {EditDayComponent} from '../../_dialoges/edit-day/edit-day.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-meals-overview',
  templateUrl: './meals-overview.component.html',
  styleUrls: ['./meals-overview.component.sass']
})
export class MealsOverviewComponent implements OnChanges {

  // TODO: z.T. beim Löschen doppelte Mahlzeiten (sie tauchen wieder auf, falls eine zweite Mahlzeit
  // gleichzeitig gelöscht wird!) Beheben analog zu tile_page class....

  @Input() access: boolean;
  @Input() day: Day;
  @Input() specificMeals: SpecificMeal[];
  @Input() days: Day[];

  @Input() hideIcons = false;
  @Output() mealDropped = new EventEmitter<[SpecificMeal, CdkDragDrop<any, any>]>();
  @Output() mealDeleted = new EventEmitter<[string, string]>();
  @Output() dayEdited = new EventEmitter<[number, Day, SpecificMeal[]]>();
  @Output() addMeal = new EventEmitter<Day>();

  public hidden = false;

  public warning: string;

  constructor(public dialog: MatDialog, public swissDateAdapter: SwissDateAdapter) {
  }

  log(str) {

    console.log(str);

  }

  ngOnChanges() {

    // Sortiert die Mahlzeiten
    this.warning = '';

    this.sortMeals();

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
  private sortMeals() {

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

}
