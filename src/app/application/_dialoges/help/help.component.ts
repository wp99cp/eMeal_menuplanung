import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {HelpMessage} from '../../_service/help.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.sass']
})
export class HelpComponent {

  public message: HelpMessage;
  private index: number;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { index: number, messages: HelpMessage[] }) {

    this.index = data.index;
    this.message = data.messages[this.index];

  }

  nextMessage() {

    this.index = (this.index + 1) % this.data.messages.length;
    this.message = this.data.messages[this.index];

  }

}
