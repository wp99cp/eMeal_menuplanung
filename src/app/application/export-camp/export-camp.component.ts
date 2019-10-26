import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-export-camp',
  templateUrl: './export-camp.component.html',
  styleUrls: ['./export-camp.component.sass']
})
export class ExportCampComponent implements OnInit {

  

  constructor() { }

  ngOnInit() {
  }

  /** Druckt die aktuelle Seite (mit der Druckfunktion des Browsers). */
  print() {

    window.print();

  }
}
