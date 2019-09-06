import { Component, OnInit, Input } from '@angular/core';
import { Camp } from '../../_class/camp';
import { Router } from '@angular/router';

@Component({
  selector: 'app-camp-list-element',
  templateUrl: './camp-list-element.component.html',
  styleUrls: ['./camp-list-element.component.sass']
})
export class CampListElementComponent implements OnInit {

  @Input() camp: Camp;

  constructor(private router: Router) { }

  ngOnInit() {

  }

}
