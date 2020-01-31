import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AuthenticationService } from '../../_service/authentication.service';
import { Observable, empty } from 'rxjs';
import { FirestoreRecipe } from '../../_interfaces/firestore-recipe';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-create-recipe',
  templateUrl: './create-recipe.component.html',
  styleUrls: ['./create-recipe.component.sass']
})
export class CreateRecipeComponent implements OnInit {

  public newRecipeForm: FormGroup;

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {

    this.newRecipeForm = formBuilder.group({

      title: '',
      description: '',
      notes: ''

    });

  }

  ngOnInit() {
  }

  public close(): Observable<any> {

    return empty();

  }

  public create(): Observable<FirestoreRecipe> {

    return this.authService.getCurrentUser().pipe(map(user => {
      return {
        name: this.newRecipeForm.value.title,
        description: this.newRecipeForm.value.description,
        access: { [user.uid]: 'owner' },
        ingredients: [],
        notes: this.newRecipeForm.value.notes,
        meals: []
      };
    }));


  }

}
