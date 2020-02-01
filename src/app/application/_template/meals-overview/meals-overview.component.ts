import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Day } from '../../_class/day';
import { MatDialog } from '@angular/material';
import { EditDayComponent } from '../../_dialoges/edit-day/edit-day.component';
import { SwissDateAdapter } from 'src/app/utils/format-datapicker';

@Component({
  selector: 'app-meals-overview',
  templateUrl: './meals-overview.component.html',
  styleUrls: ['./meals-overview.component.sass']
})
export class MealsOverviewComponent implements OnChanges {

  @Input() day: Day;
  @Input() hideIcons = false;
  @Output() mealDropped = new EventEmitter<any>();
  @Output() mealDeleted = new EventEmitter<[string, string]>();
  @Output() dayEdited = new EventEmitter<[number, Day]>();
  public hidden = false;

  public warning: string;

  constructor(public dialog: MatDialog, public swissDateAdapter: SwissDateAdapter) { }


  ngOnChanges() {

    // Sortiert die Mahlzeiten
    this.warning = '';
    const orderOfMahlzeiten = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack'];
    const pluralOfMahlzeiten = ['Zmorgen', 'Znüni\'s', 'Zmittage', 'Zvieri\'s', 'Znacht\'s', 'Leitersnack\'s'];

    this.day.meals.sort((a, b) => {

      if (a.name === b.name) {
        this.warning = 'Achtung mehrere ' + pluralOfMahlzeiten[orderOfMahlzeiten.indexOf(a.name)] + '!';
      }

      return orderOfMahlzeiten.indexOf(a.name) - orderOfMahlzeiten.indexOf(b.name);
    });

  }

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

    this.dialog
      .open(EditDayComponent, { height: '618px', width: '1000px', data: { day } })
      .afterClosed()
      .subscribe((save: number) => {

        this.dayEdited.emit([save, this.day]);

      });

  }

}
