import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TemplateHeaderComponent as Header } from 'src/app/_template/template-header/template-header.component';

import { DatabaseService } from '../../_service/database.service';

@Component({
  selector: 'app-feedback-page',
  templateUrl: './feedback-page.component.html',
  styleUrls: ['./feedback-page.component.sass']
})
export class FeedbackPageComponent implements OnInit {

  public feedbackForm: FormGroup;

  constructor(private formBuilder: FormBuilder, private dbService: DatabaseService) {

    this.setHeaderInfo();

    this.feedbackForm = this.formBuilder.group({
      title: '',
      feedback: ''
    });

  }

  ngOnInit() { }

  public send() {

    this.dbService.addFeedback(this.feedbackForm.value);
    alert('Dein Feedback wurde erfolgreich gesenden! Dank dir!');
    this.feedbackForm.reset();

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {

    Header.title = 'Probleme melden! Feedback geben!';
    Header.path = ['Startseite', 'Feedback'];

  }

}
