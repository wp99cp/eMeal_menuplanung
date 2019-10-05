import { Component, OnInit, Input } from '@angular/core';
import { Day } from '../../_class/day';

@Component({
  selector: 'app-day-element',
  templateUrl: './day-element.component.html',
  styleUrls: ['./day-element.component.sass']
})
export class DayElementComponent implements OnInit {


  @Input() day: Day;

  constructor() {

  }


  ngOnInit() {
  }

}
