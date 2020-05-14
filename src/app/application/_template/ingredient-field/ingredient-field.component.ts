import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'ingredient',
  templateUrl: './ingredient-field.component.html',
  styleUrls: ['./ingredient-field.component.sass']
})
export class IngredientFieldComponent<T> implements OnInit {

  @Input() fieldValue: T;
  @Input() editable: boolean;
  @Output() valueChange = new EventEmitter<T>();

  constructor() { }

  ngOnInit() { }

  valueChanged(event: Event) {

    this.valueChange.emit(event.srcElement['value'] as T);

  }

}
