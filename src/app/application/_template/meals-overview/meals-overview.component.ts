import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Day } from '../../_class/day';
import { MatDialog } from '@angular/material';
import { EditDayComponent } from '../edit-day/edit-day.component';

@Component({
  selector: 'app-meals-overview',
  templateUrl: './meals-overview.component.html',
  styleUrls: ['./meals-overview.component.sass']
})
export class MealsOverviewComponent implements OnInit {

  @Input() day: Day;
  @Input() hideIcons = false;
  @Output() mealDropped = new EventEmitter<any>();
  @Output() mealDeleted = new EventEmitter<[string, string]>();
  @Output() dayEdited = new EventEmitter<[number, Day]>();

  constructor(public dialog: MatDialog) { }

  ngOnInit() { }


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
