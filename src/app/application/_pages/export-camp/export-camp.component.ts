import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../_interfaces/user';
import { AuthenticationService } from '../../_service/authentication.service';

@Component({
  selector: 'app-export-camp',
  templateUrl: './export-camp.component.html',
  styleUrls: ['./export-camp.component.sass']
})
export class ExportCampComponent implements OnInit {

  protected user: Observable<User>;
  protected today: string;

  protected shoppingList = [
    {
      name: 'Fleisch',
      ingredients: [
        {
          food: 'Hackfleisch',
          unit: 'kg',
          measure: '2'
        }, {
          food: 'Brätchügeli',
          unit: 'kg',
          measure: '1'
        }
      ]
    },
    {
      name: 'Gemüse und Früchte',
      ingredients: [
        {
          food: 'Apfel',
          unit: 'kg',
          measure: '2'
        }
      ]
    }
  ];

  constructor(private authService: AuthenticationService) {

    this.today = (new Date()).toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  }

  ngOnInit() {

    this.user = this.authService.getCurrentUser();

  }

  /** Druckt die aktuelle Seite (mit der Druckfunktion des Browsers). */
  print() {

    window.print();

  }
}
