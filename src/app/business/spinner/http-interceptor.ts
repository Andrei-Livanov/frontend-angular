import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';
import {SpinnerService} from './spinner.service';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';

@Injectable()
export class ShowSpinnerInterceptor implements HttpInterceptor {

  constructor(private spinnerService: SpinnerService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    this.spinnerService.show();

    return next
      .handle(req)
      .pipe(
        tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            this.spinnerService.hide();
          }
        }, (error) => {
          console.log(error);
          this.spinnerService.hide();
        })
      );
  }
}
