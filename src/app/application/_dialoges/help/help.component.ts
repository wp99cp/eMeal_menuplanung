import {Component, OnInit} from '@angular/core';
import {HelpService} from '../../_service/help.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.sass']
})
export class HelpComponent implements OnInit {

  constructor(public helpService: HelpService) {
  }

  ngOnInit(): void {
  }

}
