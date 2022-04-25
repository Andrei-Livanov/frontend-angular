import {Component, OnInit} from '@angular/core';
import {AuthService, User} from '../../../../auth/service/auth.service';
import {Task} from '../../../data/model/Task';
import {Priority} from '../../../data/model/Priority';
import {Category} from '../../../data/model/Category';
import {TaskService} from '../../../data/dao/impl/TaskService';
import {CategoryService} from '../../../data/dao/impl/CategoryService';
import {PriorityService} from '../../../data/dao/impl/PriorityService';
import {StatService} from '../../../data/dao/impl/StatService';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TranslateService} from '@ngx-translate/core';
import {CategorySearchValues, TaskSearchValues} from '../../../data/dao/search/SearchObjects';
import {DashboardData} from '../../../object/DashboardData';
import {Stat} from '../../../data/model/Stat';
import {PageEvent} from '@angular/material/paginator';
import {CookieUtils} from '../../../utils/CookieUtils';
import {SpinnerService} from '../../../spinner/spinner.service';

export const LANG_RU = 'ru';
export const LANG_EN = 'en';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

  isMobile: boolean;
  isTablet: boolean;

  user: User = null;

  menuOpened = true;
  menuMode;
  menuPosition;
  showBackdrop: boolean;

  tasks: Task[];
  priorities: Priority[];
  categories: Category[];

  isLoading: boolean;

  showStat = true;

  categorySearchValues = new CategorySearchValues();
  taskSearchValues: TaskSearchValues;

  selectedCategory: Category = null;

  dash: DashboardData = new DashboardData();
  stat: Stat;

  totalTasksFound: number;

  readonly defaultPageSize = 5;
  readonly defaultPageNumber = 0;

  showSearch = false;

  cookiesUtils = new CookieUtils();

  readonly cookieTaskSearchValues = 'todo:searchValues';
  readonly cookieShowStat = 'todo:showStat';
  readonly cookieShowMenu = 'todo:showMenu';
  readonly cookieShowSearch = 'todo:showSearch';
  readonly cookieLang = 'todo:lang';

  spinner: SpinnerService;

  constructor(
    private taskService: TaskService,
    private categoryService: CategoryService,
    private priorityService: PriorityService,
    private statService: StatService,
    private authService: AuthService,
    private deviceService: DeviceDetectorService,
    private translate: TranslateService,
    private spinnerService: SpinnerService
  ) {
  }

  ngOnInit(): void {
    this.spinner = this.spinnerService;

    this.isMobile = this.deviceService.isMobile();
    this.isTablet = this.deviceService.isTablet();

    this.initSidebar();
    this.initLangCookie();

    this.authService.currentUser.subscribe(user => {
      this.user = user;
      this.categorySearchValues.email = this.user.email;

      this.statService.getOverallStat(this.user.email).subscribe((result => {
        this.stat = result;

        this.categoryService.findAll(this.user.email).subscribe(res => {
          this.categories = res;

          this.priorityService.findAll(this.user.email).subscribe(prior => {
            this.priorities = prior;
          });

          if (!this.initSearchCookie()) {
            this.taskSearchValues = new TaskSearchValues();
            this.taskSearchValues.pageSize = this.defaultPageSize;
            this.taskSearchValues.pageNumber = this.defaultPageNumber;
          }

          if (this.isMobile) {
            this.showStat = false;
          } else {
            this.initShowStatCookie();
          }

          this.initShowSearchCookie();

          this.selectCategory(this.selectedCategory);
        });
      }));
    });
  }

  initSidebar(): void {
    this.menuPosition = 'left';

    if (this.isMobile) {
      this.menuOpened = false;
      this.menuMode = 'over';
      this.showBackdrop = true;
    } else {
      this.initShowMenuCookie();
      this.menuMode = 'push';
      this.showBackdrop = false;
    }
  }

  toggleMenu(): void {
    this.menuOpened = !this.menuOpened;
    this.cookiesUtils.setCookie(this.cookieShowMenu, String(this.menuOpened));
  }

  addCategory(category: Category): void {
    this.categoryService.add(category).subscribe(() => this.searchCategory(this.categorySearchValues));
  }

  updateCategory(category: Category): void {
    this.categoryService.update(category).subscribe(() => this.searchCategory(this.categorySearchValues));
  }

  searchCategory(categorySearchValues: CategorySearchValues): void {
    this.categoryService.findCategories(categorySearchValues).subscribe(result => this.categories = result);
  }

  deleteCategory(category: Category): void {
    if (this.selectedCategory && category.id === this.selectedCategory.id) {
      this.selectedCategory = null;
    }

    this.categoryService.delete(category.id).subscribe(() => {
      this.searchCategory(this.categorySearchValues);
      this.selectCategory(this.selectedCategory);
    });
  }

  selectCategory(category: Category): void {
    this.selectedCategory = category;

    if (category) {
      this.dash.completedTotal = category.completedCount;
      this.dash.uncompletedTotal = category.uncompletedCount;
    } else {
      this.dash.completedTotal = this.stat.completedTotal;
      this.dash.uncompletedTotal = this.stat.uncompletedTotal;
    }

    this.taskSearchValues.pageNumber = 0;
    this.taskSearchValues.categoryId = category ? category.id : null;
    this.searchTasks(this.taskSearchValues);
  }

  toggleStat(showStat: boolean): void {
    this.showStat = showStat;
    this.cookiesUtils.setCookie(this.cookieShowStat, String(showStat));
  }

  searchTasks(taskSearchValues: TaskSearchValues): void {
    this.cookiesUtils.setCookie(this.cookieTaskSearchValues, JSON.stringify(this.taskSearchValues));

    this.taskSearchValues = taskSearchValues;
    this.taskSearchValues.email = this.user.email;

    this.taskService.findTasks(this.taskSearchValues).subscribe(result => {
      this.totalTasksFound = result.totalElements;
      this.tasks = result.content;
    });
  }

  updateOverallStat(): void {
    this.statService.getOverallStat(this.user.email).subscribe((res => {
      this.stat = res;

      if (!this.selectedCategory) {
        this.dash.uncompletedTotal = this.stat.uncompletedTotal;
        this.dash.completedTotal = this.stat.completedTotal;
      }
    }));
  }

  updateCategoryStat(category: Category): void {
    this.categoryService.findById(category.id).subscribe(cat => {
      const tmpCategory = this.categories.find(t => t.id === category.id);
      this.categories[this.categories.indexOf(tmpCategory)] = cat;

      if (this.selectedCategory && this.selectedCategory.id === cat.id) {
        this.dash.uncompletedTotal = cat.uncompletedCount;
        this.dash.completedTotal = cat.completedCount;
      }
    });
  }

  updateTask(task: Task): void {
    this.taskService.update(task).subscribe(() => {
      if (task.oldCategory) {
        this.updateCategoryStat(task.oldCategory);
      }

      if (task.category) {
        this.updateCategoryStat(task.category);
      }

      this.updateOverallStat();
      this.searchTasks(this.taskSearchValues);
    });
  }

  deleteTask(task: Task): void {
    this.taskService.delete(task.id).subscribe(() => {
      if (task.category) {
        this.updateCategoryStat(task.category);
      }

      this.updateOverallStat();
      this.searchTasks(this.taskSearchValues);
    });
  }

  addTask(task: Task): void {
    task.user = this.user;

    this.taskService.add(task).subscribe(() => {
      if (task.category) {
        this.updateCategoryStat(task.category);
      }

      this.updateOverallStat();
      this.searchTasks(this.taskSearchValues);
    });
  }

  paging(pageEvent: PageEvent): void {
    if (this.taskSearchValues.pageSize !== pageEvent.pageSize) {
      this.taskSearchValues.pageNumber = 0;
    } else {
      this.taskSearchValues.pageNumber = pageEvent.pageIndex;
    }

    this.taskSearchValues.pageSize = pageEvent.pageSize;
    this.searchTasks(this.taskSearchValues);
  }

  toggleSearch(showSearch: boolean): void {
    this.showSearch = showSearch;
    this.cookiesUtils.setCookie(this.cookieShowSearch, String(showSearch));
  }

  initSearchCookie(): boolean {
    const cookie = this.cookiesUtils.getCookie(this.cookieTaskSearchValues);
    if (!cookie) {
      return false;
    }

    const cookieJSON = JSON.parse(cookie);
    if (!cookieJSON) {
      return false;
    }

    if (!this.taskSearchValues) {
      this.taskSearchValues = new TaskSearchValues();
    }

    const tmpPageSize = cookieJSON.pageSize;
    if (tmpPageSize) {
      this.taskSearchValues.pageSize = Number(tmpPageSize);
    }

    const tmpCategoryId = cookieJSON.categoryId;
    if (tmpCategoryId) {
      this.taskSearchValues.categoryId = Number(tmpCategoryId);
      this.selectedCategory = this.getCategoryFromArray(tmpCategoryId);
    }

    const tmpPriorityId = cookieJSON.priorityId as number;
    if (tmpPriorityId) {
      this.taskSearchValues.priorityId = Number(tmpPriorityId);
    }

    const tmpTitle = cookieJSON.title;
    if (tmpTitle) {
      this.taskSearchValues.title = tmpTitle;
    }

    const tmpCompleted = cookieJSON.cookie as number;
    if (tmpTitle >= 0) {
      this.taskSearchValues.completed = tmpCompleted;
    }

    const tmpSortColumn = cookieJSON.sortColumn;
    if (tmpSortColumn) {
      this.taskSearchValues.sortColumn = tmpSortColumn;
    }

    const tmpSortDirection = cookieJSON.sortDirection;
    if (tmpSortDirection) {
      this.taskSearchValues.sortDirection = tmpSortDirection;
    }

    const tmpDateFrom = cookieJSON.dateFrom;
    if (tmpDateFrom) {
      this.taskSearchValues.dateFrom = new Date(tmpDateFrom);
    }

    const tmpDateTo = cookieJSON.dateTo;
    if (tmpDateTo) {
      this.taskSearchValues.dateTo = new Date(tmpDateTo);
    }

    return true;
  }

  getCategoryFromArray(id: number): Category {
    return this.categories.find(t => t.id === id);
  }

  initLangCookie(): void {
    const val = this.cookiesUtils.getCookie(this.cookieLang);

    if (val) {
      this.translate.use(val);
    } else {
      this.translate.use(LANG_RU);
    }
  }

  initShowMenuCookie(): void {
    const val = this.cookiesUtils.getCookie(this.cookieShowMenu);

    if (val) {
      this.menuOpened = (val === 'true');
    }
  }

  initShowSearchCookie(): void {
    const val = this.cookiesUtils.getCookie(this.cookieShowSearch);

    if (val) {
      this.showSearch = (val === 'true');
    }
  }

  initShowStatCookie(): void {
    if (!this.isMobile) {
      const val = this.cookiesUtils.getCookie(this.cookieShowStat);

      if (val) {
        this.showStat = (val === 'true');
      }
    }
  }

  settingsChanged(priorities: Priority[]): void {
    this.priorities = priorities;
    this.searchTasks(this.taskSearchValues);
    this.cookiesUtils.setCookie(this.cookieLang, this.translate.currentLang);
  }
}
