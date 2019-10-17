import { Component, OnInit, Input } from '@angular/core';
import { Camp } from '../../_class/camp';
import { Day } from '../../_class/day';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-week-view',
  templateUrl: './week-view.component.html',
  styleUrls: ['./week-view.component.sass']
})
export class WeekViewComponent implements OnInit {

  @Input() camp: Camp;

  constructor() { }

  ngOnInit() {
  }

  private mealsChanged: boolean = false;

  /**
   * 
   * @param event 
   */
  drop(event: CdkDragDrop<string[]>) {

    this.mealsChanged = true;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
  }

  saveMeals() {

    this.camp.pushToFirestoreDB();
    this.mealsChanged = false;

  }


}
