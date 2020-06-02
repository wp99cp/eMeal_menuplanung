import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

/*

// Manipulate clipboard...
document.addEventListener('copy', function(e){
  var text = window.getSelection().toString().replace(/[\n\r]+/g, '');
  e.clipboardData.setData('text/plain', 'Hallo');
  e.preventDefault();
});
*/


@Component({
  selector: 'ingredient',
  templateUrl: './ingredient-field.component.html',
  styleUrls: ['./ingredient-field.component.sass']
})
export class IngredientFieldComponent<T> implements OnInit {

  @Input() fieldValue: T;
  @Input() editable: boolean;
  @Output() valueChange = new EventEmitter<T>();

  public isSelected = false;
  public isEditable = false;

  constructor() {
  }

  ngOnInit() {
  }

  valueChanged(value) {

    this.valueChange.emit(value as T);

  }

  selectField(event) {

    event.target.focus();
    this.isSelected = true;

  }

  deselectField(event, deselectEditable = false) {

    if (this.isEditable && !deselectEditable) {
      console.log('')
      return;
    }

    if (deselectEditable) {
      const newVal = event.target.value;
      if (newVal !== this.fieldValue && newVal !== undefined) {
        this.valueChange.emit(newVal as T);
      }
    }

    this.isSelected = false;
    this.isEditable = false;
  }

  makeEditable() {

    this.isEditable = true;

  }

}
