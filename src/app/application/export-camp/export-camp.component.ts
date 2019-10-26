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

  print() {

    window.print();

  }
}
