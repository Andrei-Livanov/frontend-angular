import {Inject, Injectable, InjectionToken} from '@angular/core';
import {CommonService} from './CommonService';
import {HttpClient} from '@angular/common/http';
import {TaskSearchValues} from '../search/SearchObjects';
import {Observable} from 'rxjs';
import {Task} from '../../model/Task';
import {TaskDAO} from '../interface/TaskDAO';

export const TASK_URL_TOKEN = new InjectionToken<string>('url');

@Injectable({
  providedIn: 'root'
})

export class TaskService extends CommonService<Task> implements TaskDAO {

  constructor(@Inject(TASK_URL_TOKEN) private baseUrl, private http: HttpClient) {
    super(baseUrl, http);
  }

  findTasks(searchObj: TaskSearchValues): Observable<any> {
    return this.http.post<any>(this.baseUrl + '/search', searchObj);
  }

}
