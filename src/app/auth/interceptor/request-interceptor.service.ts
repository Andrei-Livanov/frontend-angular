import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({withCredentials: true});

    console.log(request);

    if (request.url.includes('update-password')) {
      const token = request.params.get('token');
      request.params.delete('token');

      request = request.clone({setHeaders: ({Authorization: 'Bearer ' + token})});
    }

    return next.handle(request);
  }
}
