import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  standalone: false,
  templateUrl: './delete-camp.component.html',
  styleUrls: ['./delete-camp.component.sass']
})
export class DeleteCampComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data) { }
  ngOnInit() {
  }
}
