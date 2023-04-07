import {Component} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';
import {TemplateHeaderComponent as Header} from '../../../../shared/components/template-header/template-header.component';
import {AngularFireAuth} from '@angular/fire/compat/auth';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import FieldValue = firebase.firestore.FieldValue;

@Component({
  selector: 'app-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.sass']
})
export class FeedbackDialogComponent {
  public feedbackForm: UntypedFormGroup;
  public valueHasNotChanged = true;

  constructor(
    private formBuilder: UntypedFormBuilder,
    public snackBar: MatSnackBar,
    public fireAuth: AngularFireAuth,
    private db: AngularFirestore,
    public router: Router) {

    this.setHeaderInfo();

    this.feedbackForm = this.formBuilder.group({
      title: '',
      feedback: ''
    });


    const originalValues = {
      title: '',
      feedback: ''
    };

    // set up change listner
    this.feedbackForm.valueChanges.subscribe(values => {
      this.valueHasNotChanged = JSON.stringify(values) === JSON.stringify(originalValues);
    });

  }


  public send() {

    this.fireAuth.authState.subscribe(user => {
      this.db.collection('sharedData/feedback/messages').add(
        {
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          message: this.feedbackForm.value.feedback,
          title: this.feedbackForm.value.title,
          currentURL: this.router.url,
          date_added: FieldValue.serverTimestamp(),
          access: {[user.uid]: 'owner'}
        }).then(() => {
        this.snackBar.open('Dein Feedback wurde  gesenden!', '', {duration: 2500});
        this.feedbackForm.reset();
      });
    });

  }

  /** setzt die HeaderInfos für die aktuelle Seite */
  private setHeaderInfo(): void {

    Header.title = 'Probleme melden! Feedback geben!';
    Header.path = ['Startseite', 'Feedback'];

  }

}
