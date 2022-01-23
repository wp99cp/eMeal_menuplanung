import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './informations-page.component.html',
  styleUrls: ['./informations-page.component.sass']
})
export class InformationspageComponent implements OnInit {
  change_date_kochen_im_lager = new Date("12/15/2016");

  constructor() { }

  ngOnInit() {
  }

}
