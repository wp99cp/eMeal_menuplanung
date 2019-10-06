import { Component, OnInit, Input } from '@angular/core';
import { Day } from '../../_class/day';

@Component({
  selector: 'app-day-element',
  templateUrl: './day-element.component.html',
  styleUrls: ['./day-element.component.sass']
})
export class DayElementComponent implements OnInit {


  @Input() day: Day;
  private dateStr: string


  constructor() {

  }


  ngOnInit() {

    // generate custum date string
    this.dateStr = this.day.date.toLocaleDateString('de-CH', { "weekday": "long", "month": "short", "day": "2-digit" });

    this.day.getMeals().subscribe(meals => meals.forEach(meal => console.log(meal.title)));

  }

}
