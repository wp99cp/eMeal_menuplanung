import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { Camp } from '../../_class/camp';
import { Saveable } from '../../_service/auto-save.service';
import { DatabaseService } from '../../_service/database.service';
import { WeekViewComponent } from '../../_template/week-view/week-view.component';

@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit, Saveable {

  @ViewChildren(WeekViewComponent) weekViews: QueryList<WeekViewComponent>;

  // Toggle for saveButton
  public campInfosForm: FormGroup;

  // camp Data from server
  public camp: Observable<Camp>;

  // local changes to the camp data (not sync with server)
  constructor(private route: ActivatedRoute, private databaseService: DatabaseService, private formBuilder: FormBuilder) {

    this.campInfosForm = this.formBuilder.group({
      name: '',
      description: '',
      participants: ''
    });


    this.camp = this.route.url.pipe(mergeMap(
      url => this.databaseService.getCampById(url[1].path)
    ));

    this.camp.subscribe(camp => this.setHeaderInfo(camp));

    // update Values
    this.camp.subscribe(camp =>
      this.campInfosForm.setValue({
        name: camp.name,
        description: camp.description,
        participants: camp.participants

      })


    );

  }




  ngOnInit() { }

  // save on destroy
  public save(): void {

    // saveChilds
    this.weekViews.forEach(weekView => weekView.save());

    if (this.campInfosForm.touched) {
      console.log('Autosave Camp');
      this.camp.subscribe(camp => this.saveCamp(camp));
    }

  }

  private setHeaderInfo(camp: Camp): void {

    Header.title = camp.name;
    Header.path = ['Startseite', 'meine Lager', camp.name];

  }

  /** Save and reset the form */
  public saveCamp(camp: Camp) {

    this.saveValueChanges(camp);
    this.databaseService.updateDocument(camp.extractDataToJSON(), camp.getDocPath())

    // deactivate save button
    this.campInfosForm.markAsUntouched();

  }

  /** saved the changed values form the form */
  private saveValueChanges(camp: Camp) {
    camp.name = this.campInfosForm.value.name;
    camp.description = this.campInfosForm.value.description;
    camp.participants = this.campInfosForm.value.participants;
  }

}
