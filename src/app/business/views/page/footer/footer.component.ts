import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {AboutDialogComponent} from '../../dialog/about-dialog/about-dialog.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  year: Date;
  site = 'https://javabegin.ru/';
  course = 'http://101112.ru/ang-spring-auth';

  blog = 'https://javabegin.ru/blog/tag/angular/';
  siteName = 'JavaBegin';

  constructor(private dialogBuilder: MatDialog) {
  }

  ngOnInit(): void {
    this.year = new Date();
  }

  openAboutDialog(): void {
    this.dialogBuilder.open(AboutDialogComponent, {
      autoFocus: false,
      data: {
        dialogTitle: 'О программе',
        message: 'Данное приложение было создано для видеокурса "Angular+Java/SprigBoot/Hibernate" на сайте javabegin.ru'
      },
      width: '400px'
    });
  }
}
