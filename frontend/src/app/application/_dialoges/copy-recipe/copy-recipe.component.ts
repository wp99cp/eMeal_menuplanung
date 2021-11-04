import {Component, OnInit} from '@angular/core';
import {HelpService} from '../../_service/help.service';

@Component({
  selector: 'app-copy-recipe',
  templateUrl: './copy-recipe.component.html',
  styleUrls: ['./copy-recipe.component.sass']
})
export class CopyRecipeComponent implements OnInit {

  constructor(public helpService: HelpService) {
  }

  ngOnInit() {
  }

}
