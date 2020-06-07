import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HelpMessage} from '../../_service/help.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.sass']
})
export class HelpComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: HelpMessage }) {

  }

  ngOnInit(): void {

  }

}
