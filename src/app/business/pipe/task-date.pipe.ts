import {Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DatePipe} from '@angular/common';

// https://angular.io/guide/pipes

@Pipe({
  name: 'taskDate'
})
export class TaskDatePipe implements PipeTransform {

  constructor(private translate: TranslateService) {
  }

  transform(date: Date | string, format: string = 'mediumDate'): string {
    if (!date) {
      return this.translate.instant('TASKS.WITHOUT-DATE');
    }

    date = new Date(date);

    const currentDate = new Date().getDate();

    if (date.getDate() === currentDate) {
      return this.translate.instant('TASKS.TODAY');
    }

    if (date.getDate() === currentDate - 1) {
      return this.translate.instant('TASKS.YESTERDAY');
    }

    if (date.getDate() === currentDate + 1) {
      return this.translate.instant('TASKS.TOMORROW');
    }

    return new DatePipe(this.translate.currentLang).transform(date, format);
  }
}
