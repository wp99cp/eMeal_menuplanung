import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Day } from '../../_class/day';
import { MatDialog } from '@angular/material';
import { EditDayComponent } from '../../_dialoges/edit-day/edit-day.component';

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

  constructor(public dialog: MatDialog) { }


  ngOnChanges() {

    // Sortiert die Mahlzeiten
    const orderOfMahlzeiten = ['Zmorgen', 'Znüni', 'Zmittag', 'Zvieri', 'Znacht', 'Leitersnack', 'Vorbereiten'];
    this.day.meals.sort((a, b) => orderOfMahlzeiten.indexOf(a.name) - orderOfMahlzeiten.indexOf(b.name));

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
