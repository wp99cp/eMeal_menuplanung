import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Camp } from '../../_class/camp';
import { DatabaseService } from '../../_service/database.service';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';


@Component({
  selector: 'app-edit-camp-page',
  templateUrl: './edit-camp-page.component.html',
  styleUrls: ['./edit-camp-page.component.sass']
})
export class EditCampPageComponent implements OnInit {

  // Toggle for saveButton
  public campInfosForm: FormGroup;

  // camp Data from server
  public camp: Observable<Camp>;

  // local changes to the camp data (not sync with server)
  constructor(private route: ActivatedRoute, private databaseService: DatabaseService, private formBuilder: FormBuilder) { }

  ngOnInit() {

    this.campInfosForm = this.formBuilder.group({
      name: '',
      description: '',
      participants: ''
    });

    // load camp from url
    this.route.url.subscribe(url =>
      this.loadCamp(url[1].path));


    // update Values
    this.camp.subscribe(camp =>
      this.campInfosForm.setValue({
        name: camp.name,
        description: camp.description,
        participants: camp.participants

      })


    );

  }


  /**
   * Loads a camp form the database
   *
   * @param campId Id of the camp
   */
  loadCamp(campId: string) {

    this.camp = this.databaseService.getCampById(campId);
    this.camp.subscribe(camp => this.setHeaderInfo(camp));


  }

  private setHeaderInfo(camp: Camp): void {

    Header.title = camp.name;
    Header.path = ['eMeal', 'meine Lager', camp.name];

  }

  /** Save and reset the form */
  public saveCampInfo(camp: Camp) {

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