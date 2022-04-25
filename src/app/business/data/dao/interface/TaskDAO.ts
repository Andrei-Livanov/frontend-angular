import {CommonDAO} from './CommonDAO';
import {Task} from '../../model/Task';
import {TaskSearchValues} from '../search/SearchObjects';
import {Observable} from 'rxjs';

export interface TaskDAO extends CommonDAO<Task> {

  findTasks(taskSearchValues: TaskSearchValues): Observable<Task[]>;

}
