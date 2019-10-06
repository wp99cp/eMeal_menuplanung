import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../_service/authentication.service';

@Component({
  selector: 'app-welcom-page',
  templateUrl: './welcom-page.component.html',
  styleUrls: ['./welcom-page.component.sass']
})
export class WelcomPageComponent implements OnInit {


  constructor(private auth: AuthenticationService) { }

  ngOnInit() { }



}
