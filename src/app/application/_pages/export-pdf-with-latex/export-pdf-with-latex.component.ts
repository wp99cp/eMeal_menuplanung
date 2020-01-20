import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../_service/database.service';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-export-pdf-with-latex',
  templateUrl: './export-pdf-with-latex.component.html',
  styleUrls: ['./export-pdf-with-latex.component.sass']
})
export class ExportPdfWithLatexComponent implements OnInit {

  private campId: Observable<string>;

  constructor(private route: ActivatedRoute, private dbService: DatabaseService) {

    this.campId = this.route.url.pipe(map(url => url[1].path));
    this.campId.subscribe(console.log);
    
  }

  ngOnInit() {
  }

  pdf() {

    this.campId.subscribe(campId => this.dbService.createPDF(campId));


  }

}
