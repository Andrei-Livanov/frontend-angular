import {Injectable} from '@angular/core';
import * as introJs from 'intro.js/intro.js';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class IntroService {

  introJS = introJs();

  constructor(private translate: TranslateService) {
  }

  public startIntroJS(): void {
    this.introJS.setOptions(
      {
        nextLabel: this.translate.instant('HELP.NEXT') + ' >',
        prevLabel: '< ' + this.translate.instant('HELP.PREV'),
        doneLabel: this.translate.instant('HELP.EXIT'),
        skipLabel: this.translate.instant('HELP.EXIT'),
        exitOnEsc: true,
        exitOnOverlayClick: false
      });

    this.introJS.start();
  }
}
