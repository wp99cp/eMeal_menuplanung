import {Component} from '@angular/core';
import {SaveStatusService} from '../../../modules/application-module/services/save-status.service';

/**
 * Shows in the header whether the changes of the user are saved.
 *
 */
@Component({
  standalone: false,
  selector: 'app-save-status',
  templateUrl: './save-status.component.html',
  styleUrls: ['./save-status.component.sass']
})
export class SaveStatusComponent {

  constructor(public saveStatus: SaveStatusService) {
  }

}
