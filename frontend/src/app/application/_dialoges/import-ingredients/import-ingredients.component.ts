import {Component, OnInit} from '@angular/core';
import {Ingredient} from '../../_interfaces/firestoreDatatypes';

@Component({
  selector: 'app-import-ingredients',
  templateUrl: './import-ingredients.component.html',
  styleUrls: ['./import-ingredients.component.sass']
})
export class ImportIngredientsComponent implements OnInit {

  public inputParsedSuccessfully = false;
  public parseError = '';

  public ingredients: Ingredient[];

  constructor() {
  }

  ngOnInit(): void {
  }

  parseInput(inputText: string) {

    this.parseError = '';

    const parsedInput = inputText.split('\n').map(line => line.split('\t'));

    if (parsedInput[parsedInput.length - 1].length === 1 && parsedInput[parsedInput.length - 1][0] === '') {
      parsedInput.pop();
    }

    if (!parsedInput.map(line => line.length === 3).every(Boolean)) {
      this.parseError = 'Es ist ein Fehler aufgetreten. Überprüfe deine Eingabe.';
      return;
    }


    this.ingredients = parsedInput.map(line => {

      const ingredient = {
        food: line[2],
        unit: line[1],
        measure: Number.parseFloat(line[0]),
        comment: '',
        fresh: false,
        unique_id: ''
      };

      return ingredient;

    });

    this.inputParsedSuccessfully = true;

  }
}
