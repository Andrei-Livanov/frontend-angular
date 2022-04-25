import {Priority} from './Priority';
import {Category} from './Category';
import {User} from '../../../auth/service/auth.service';

export class Task {
  id: number;
  title: string;
  completed: number;
  priority: Priority;
  category: Category;
  taskDate?: Date;
  user: User;
  oldCategory: Category;

  constructor(id: number, title: string, completed: number, priority: Priority, category: Category, user: User, taskDate?: Date) {
    this.id = id;
    this.title = title;
    this.completed = completed;
    this.priority = priority;
    this.category = category;
    this.taskDate = taskDate;
    this.user = user;
  }
}
