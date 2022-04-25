import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {User} from '../../../../auth/service/auth.service';
import {Category} from '../../../data/model/Category';
import {Task} from '../../../data/model/Task';
import {MatTableDataSource} from '@angular/material/table';
import {TaskSearchValues} from '../../../data/dao/search/SearchObjects';
import {MatDialog} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TranslateService, TranslationChangeEvent} from '@ngx-translate/core';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {DialogAction} from '../../../object/DialogResult';
import {Priority} from '../../../data/model/Priority';
import {EditTaskDialogComponent} from '../../dialog/edit-task-dialog/edit-task-dialog.component';
import {PageEvent} from '@angular/material/paginator';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {AbstractControl, FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css'],

  animations: [
    trigger('searchRegion', [
      state('show', style({
        overflow: 'hidden',
        height: '*',
        opacity: '10'
      })),
      state('hide', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px'
      })),
      transition('* => *', animate('300ms ease-in-out'))
    ])
  ]
})
export class TasksComponent implements OnInit {

  @Input()
  totalTasksFounded: number;

  @Input()
  user: User;

  @Input()
  selectedCategory: Category;

  @Input('tasks')
  set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.assignTableSource();
  }

  @Input('taskSearchValues')
  set setTaskSearchValues(taskSearchValues: TaskSearchValues) {
    this.taskSearchValues = taskSearchValues;
    this.initSearchValues();
    this.initSortDirectionIcon();
  }

  @Input('priorities')
  set setPriorities(priorities: Priority[]) {
    this.priorities = priorities;
  }

  @Input('categories')
  set setCategories(categories: Category[]) {
    this.categories = categories;
  }

  @Input('showSearch')
  set setShowSearch(show: boolean) {
    this.showSearch = show;
    this.initAnimation();
  }

  @Output()
  addTaskEvent = new EventEmitter<Task>();

  @Output()
  deleteTaskEvent = new EventEmitter<Task>();

  @Output()
  updateTaskEvent = new EventEmitter<Task>();

  @Output()
  pagingEvent = new EventEmitter<PageEvent>();

  @Output()
  toggleSearchEvent = new EventEmitter<boolean>();

  @Output()
  searchActionEvent = new EventEmitter<TaskSearchValues>();

  priorities: Priority[];
  categories: Category[];
  tasks: Task[];

  displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category', 'operations'];
  dataSource: MatTableDataSource<Task> = new MatTableDataSource<Task>();

  filterTitle: string;
  filterCompleted: number;
  filterPriorityId: number;
  filterSortColumn: string;
  filterSortDirection: string;
  dateRangeForm: FormGroup;

  isMobile: boolean;

  taskSearchValues: TaskSearchValues;

  translateWithoutCategory: string;
  translateWithoutPriority: string;

  animationState: string;
  showSearch = false;

  readonly colorCompletedTask = '#F8F9FA';
  readonly colorWhite = '#fff';

  filterChanged = false;

  sortIconName: string;

  readonly iconNameDown = 'arrow_downward';
  readonly iconNameUp = 'arrow_upward';

  readonly defaultSortColumn = 'title';
  readonly defaultSortDirection = 'asc';

  constructor(
    private dialogBuilder: MatDialog,
    private deviceService: DeviceDetectorService,
    private translate: TranslateService
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  ngOnInit(): void {
    this.translate.onLangChange.subscribe((event: TranslationChangeEvent) => {
      this.initTranslations();
    });

    this.initTranslations();
    this.initDateRangeForm();
  }

  get dateFrom(): AbstractControl {
    return this.dateRangeForm.get('dateFrom');
  }

  get dateTo(): AbstractControl {
    return this.dateRangeForm.get('dateTo');
  }

  initTranslations(): void {
    this.translate.get(['TASKS.WITHOUT-CATEGORY', 'TASKS.WITHOUT-PRIORITY']).subscribe((res: string) => {
      this.translateWithoutCategory = res['TASKS.WITHOUT-CATEGORY'];
      this.translateWithoutPriority = res['TASKS.WITHOUT-PRIORITY'];
    });
  }

  assignTableSource(): void {
    if (!this.dataSource) {
      return;
    }

    this.dataSource.data = this.tasks;
  }

  getPriorityColor(task: Task): string {
    if (task.completed) {
      return this.colorCompletedTask;
    }

    if (task.priority && task.priority.color) {
      return task.priority.color;
    }

    return this.colorWhite;
  }

  onToggleCompleted(task: Task): void {
    if (task.completed === 0) {
      task.completed = 1;
    } else {
      task.completed = 0;
    }

    this.updateTaskEvent.emit(task);
  }

  openDeleteDialog(task: Task): void {
    const dialogRef = this.dialogBuilder.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('TASKS.CONFIRM-DELETE', {name: task.title})
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) {
        return;
      }

      if (result.action === DialogAction.OK) {
        this.deleteTaskEvent.emit(task);
      }
    });
  }

  openEditDialog(task: Task): void {
    const dialogRef = this.dialogBuilder.open(EditTaskDialogComponent, {
      data: [task, this.translate.instant('TASKS.EDITING'), this.categories, this.priorities],
      autoFocus: false,
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) {
        return;
      }

      if (result.action === DialogAction.DELETE) {
        this.deleteTaskEvent.emit(task);
        return;
      }

      if (result.action === DialogAction.COMPLETE) {
        task.completed = 1;
        this.updateTaskEvent.emit(task);
      }

      if (result.action === DialogAction.ACTIVATE) {
        task.completed = 0;
        this.updateTaskEvent.emit(task);
        return;
      }

      if (result.action === DialogAction.SAVE) {
        this.updateTaskEvent.emit(task);
        return;
      }
    });
  }

  openAddDialog(): void {
    const task = new Task(null, '', 0, null, this.selectedCategory, this.user);

    const dialogRef = this.dialogBuilder.open(EditTaskDialogComponent, {
      data: [task, this.translate.instant('TASKS.ADDING'), this.categories, this.priorities],
      maxHeight: '95vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) {
        return;
      }

      if (result.action === DialogAction.SAVE) {
        this.addTaskEvent.emit(task);
      }
    });
  }

  pageChanged(pageEvent: PageEvent): void {
    this.pagingEvent.emit(pageEvent);
  }

  initAnimation(): void {
    if (this.showSearch) {
      this.animationState = 'show';
    } else {
      this.animationState = 'hide';
    }
  }

  initDateRangeForm(): void {
    this.dateRangeForm = new FormGroup({
      dateFrom: new FormControl(),
      dateTo: new FormControl()
    });

    this.dateFrom.valueChanges.subscribe(() => this.checkFilterChanged());
    this.dateTo.valueChanges.subscribe(() => this.checkFilterChanged());
  }

  checkFilterChanged(): boolean {
    if (!this.taskSearchValues) {
      return;
    }

    this.filterChanged = false;

    if (this.taskSearchValues.title !== this.filterTitle) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.completed !== this.filterCompleted) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.priorityId !== this.filterPriorityId) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.sortColumn !== this.filterSortColumn) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.sortDirection !== this.filterSortDirection) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.dateFrom !== this.dateFrom.value) {
      this.filterChanged = true;
    }

    if (this.taskSearchValues.dateTo !== this.dateTo.value) {
      this.filterChanged = true;
    }
  }

  initSortDirectionIcon(): void {
    if (this.filterSortDirection === 'desc') {
      this.sortIconName = this.iconNameDown;
    } else {
      this.sortIconName = this.iconNameUp;
    }
  }

  changedSortDirection(): void {
    if (this.filterSortDirection === 'asc') {
      this.filterSortDirection = 'desc';
    } else {
      this.filterSortDirection = 'asc';
    }

    this.initSortDirectionIcon();
  }


  initSearchValues(): void {
    if (!this.taskSearchValues) {
      return;
    }

    this.filterTitle = this.taskSearchValues.title;
    this.filterCompleted = this.taskSearchValues.completed;
    this.filterPriorityId = this.taskSearchValues.priorityId;
    this.filterSortColumn = this.taskSearchValues.sortColumn;
    this.filterSortDirection = this.taskSearchValues.sortDirection;

    if (this.taskSearchValues.dateFrom) {
      this.dateFrom.setValue(this.taskSearchValues.dateFrom);
    }

    if (this.taskSearchValues.dateTo) {
      this.dateTo.setValue(this.taskSearchValues.dateTo);
    }
  }

  clearSearchValues(): void {
    this.filterTitle = '';
    this.filterCompleted = null;
    this.filterPriorityId = null;
    this.filterSortColumn = this.defaultSortColumn;
    this.filterSortDirection = this.defaultSortDirection;
    this.clearDateRange();
  }

  clearDateRange(): void {
    this.dateFrom.setValue(null);
    this.dateTo.setValue(null);
  }

  onToggleSearch(): void {
    this.toggleSearchEvent.emit(!this.showSearch);
    this.initAnimation();
  }

  initSearch(): void {
    this.taskSearchValues.title = this.filterTitle;
    this.taskSearchValues.completed = this.filterCompleted;
    this.taskSearchValues.priorityId = this.filterPriorityId;
    this.taskSearchValues.sortColumn = this.filterSortColumn;
    this.taskSearchValues.sortDirection = this.filterSortDirection;
    this.taskSearchValues.dateFrom = this.dateFrom.value;
    this.taskSearchValues.dateTo = this.dateTo.value;

    this.searchActionEvent.emit(this.taskSearchValues);
    this.filterChanged = false;
  }
}
