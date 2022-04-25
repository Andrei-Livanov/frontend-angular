import {CommonDAO} from './CommonDAO';
import {Category} from '../../model/Category';
import {CategorySearchValues} from '../search/SearchObjects';
import {Observable} from 'rxjs';

export interface CategoryDAO extends CommonDAO<Category> {

  findCategories(categorySearchValues: CategorySearchValues): Observable<Category[]>;

}
