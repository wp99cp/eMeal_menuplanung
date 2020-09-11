import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TemplateHeaderComponent as Header} from '../../../_template/template-header/template-header.component';

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.sass']
})
export class FeedbackDialogComponent implements OnInit {
  public feedbackForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public snackBar: MatSnackBar) {

    this.setHeaderInfo();

    this.feedbackForm = this.formBuilder.group({
      title: '',
      feedback: ''
    });

  }

  ngOnInit() {
  }

  public send() {

    this.addFeedback(this.feedbackForm.value);
    this.snackBar.open('Dein Feedback wurde  gesenden!', '', {duration: 2500});
    this.feedbackForm.reset();


  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {

    Header.title = 'Probleme melden! Feedback geben!';
    Header.path = ['Startseite', 'Feedback'];

  }

  public addFeedback(feedback: any) {

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://emeal.zh11.ch/services/sendMailToTrello.php', true);

    // Send the proper header information along with the request
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function () { // Call a function when the state changes.
      if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
        // Request finished. Do processing here.
      }
    };

    xhr.send('title=' + feedback.title + '&feedback=' + feedback.feedback);

  }

}
