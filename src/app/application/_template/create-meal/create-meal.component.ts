import { Component, OnInit } from '@angular/core';
import { FirestoreMeal } from '../../_interfaces/firestore-meal';
import { AuthenticationService } from '../../_service/authentication.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { empty } from 'rxjs';

/**
 * TODO: Hier können später direkt Rezepte ausgewählt werden.
 */
@Component({
  selector: 'app-create-meal',
  templateUrl: './create-meal.component.html',
  styleUrls: ['./create-meal.component.sass']
})
export class CreateMealComponent implements OnInit {

  public newMealForm: FormGroup;

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {

    this.newMealForm = formBuilder.group({

      title: '',
      description: ''

    });

  }

  ngOnInit() {
  }

  public close(): Observable<any> {

    return empty();

  }

  public create(): Observable<FirestoreMeal> {

    return this.authService.getCurrentUser().pipe(map(user => {
      return {
        title: this.newMealForm.value.title,
        description: this.newMealForm.value.description,
        access: { owner: [user.uid], editor: [] }
      };
    }));



  }

}
