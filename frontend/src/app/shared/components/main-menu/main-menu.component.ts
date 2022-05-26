import {Component, OnInit} from '@angular/core';
import {TemplateHeaderComponent} from '../template-header/template-header.component';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {HelpService} from "../../../modules/application-module/services/help.service";
import {AuthenticationService} from "../../../modules/application-module/services/authentication.service";
import {HistoryService} from "../../../services/history.service";
import {Camp} from "../../../modules/application-module/classes/camp";
import {
  FeedbackDialogComponent
} from "../../../modules/application-module/dialoges/feedback-dialog/feedback-dialog.component";

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.sass']
})
export class MainMenuComponent implements OnInit {


  public lastCamp: Camp;
  public isAdmin = false;
  public isSignedIn = false;

  constructor(private router: Router,
              private auth: AuthenticationService,
              private location: Location,
              public helpService: HelpService,
              private dialog: MatDialog,
              public historyService: HistoryService) {

    this.helpService.addDialog(dialog);

    historyService.lastUsedCamp.subscribe(camp => {
      this.lastCamp = camp;
    });


  }

  async ngOnInit(): Promise<void> {


    this.auth.isSignedIn().subscribe(res => {
      this.isSignedIn = res;
    });

    this.auth.isAdmin().then(adminState => this.isAdmin = adminState);

  }

  closeMenu() {
    TemplateHeaderComponent.showMenu();
  }

  isInsideApp() {
    return this.router.url.includes('app');
  }

  signOut() {

    this.auth.signOut();
    this.isSignedIn = false;

  }

  openFeedbackDialog() {

    this.dialog.open(FeedbackDialogComponent, {
      height: '800px',
      width: '550px',
      data: {}
    }).afterClosed().subscribe();


  }

}
