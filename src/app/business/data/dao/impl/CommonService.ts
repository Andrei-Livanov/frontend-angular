import {CommonDAO} from '../interface/CommonDAO';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

export class CommonService<T> implements CommonDAO<T> {

  private readonly url: string;

  constructor(url: string, private httpClient: HttpClient) {
    this.url = url;
  }

  add(t: T): Observable<T> {
    return this.httpClient.put<T>(this.url + '/add', t);
  }

  delete(id: number): Observable<any> {
    return this.httpClient.delete<any>(this.url + '/delete/' + id);
  }

  findAll(email: string): Observable<T[]> {
    return this.httpClient.post<T[]>(this.url + '/all', email);
  }

  findById(id: number): Observable<T> {
    return this.httpClient.post<T>(this.url + '/id', id);
  }

  update(t: T): Observable<any> {
    return this.httpClient.patch<any>(this.url + '/update', t);
  }

}
