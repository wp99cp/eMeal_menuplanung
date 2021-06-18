import {Component, OnInit} from '@angular/core';
import {TemplateHeaderComponent} from '../template-header/template-header.component';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {HelpService} from '../../application/_service/help.service';
import {MatDialog} from '@angular/material/dialog';
import {CurrentlyUsedMealService} from '../currently-used-meal.service';
import {Camp} from '../../application/_class/camp';
import {FeedbackDialogComponent} from '../../application/_dialoges/feedback-dialog/feedback-dialog.component';
import {AuthenticationService} from '../../application/_service/authentication.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.sass']
})
export class MainMenuComponent implements OnInit {


  public lastCamp: Camp;

  public isSignedIn = false;

  constructor(private router: Router,
              private auth: AuthenticationService,
              private location: Location,
              public helpService: HelpService,
              private dialog: MatDialog,
              public main: CurrentlyUsedMealService) {

    this.helpService.addDialog(dialog);

    main.lastUsage.subscribe(camp => {
      this.lastCamp = camp;
    });

  }

  async ngOnInit(): Promise<void> {


    this.auth.isSignedIn().subscribe(res => {
      this.isSignedIn = res;
    });


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
