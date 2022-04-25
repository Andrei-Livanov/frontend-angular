import {Component, Inject, OnInit} from '@angular/core';
import {Category} from '../../../data/model/Category';
import {Priority} from '../../../data/model/Priority';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Task} from '../../../data/model/Task';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TranslateService} from '@ngx-translate/core';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-task-dialog',
  templateUrl: './edit-task-dialog.component.html',
  styleUrls: ['./edit-task-dialog.component.css']
})
export class EditTaskDialogComponent implements OnInit {

  categories: Category[];
  priorities: Priority[];

  isMobile = this.deviceService.isMobile();

  dialogTitle: string;
  task: Task;

  newTitle: string;
  newPriorityId: number;
  newCategoryId: number;
  newDate: Date;
  oldCategoryId: number;

  canDelete = false;
  canComplete = false;

  today = new Date();

  constructor(private dialogRef: MatDialogRef<EditTaskDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: [Task, string, Category[], Priority[]],
              private dialogBuilder: MatDialog,
              private deviceService: DeviceDetectorService,
              private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.task = this.data[0];
    this.dialogTitle = this.data[1];
    this.categories = this.data[2];
    this.priorities = this.data[3];

    if (this.task && this.task.id > 0) {
      this.canDelete = true;
      this.canComplete = true;
    }

    this.newTitle = this.task.title;

    if (this.task.priority) {
      this.newPriorityId = this.task.priority.id;
    }

    if (this.task.category) {
      this.newCategoryId = this.task.category.id;
      this.oldCategoryId = this.task.category.id;
    }

    if (this.task.taskDate) {
      this.newDate = new Date(this.task.taskDate);
    }
  }

  confirm(): void {
    if (!this.newTitle || this.newTitle.trim().length === 0) {
      return;
    }

    this.task.title = this.newTitle;
    this.task.priority = this.findPriorityById(this.newPriorityId);
    this.task.category = this.findCategoryById(this.newCategoryId);
    this.task.oldCategory = this.findCategoryById(this.oldCategoryId);

    if (!this.newDate) {
      this.task.taskDate = null;
    } else {
      this.task.taskDate = this.newDate;
    }

    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.task));
  }

  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  delete(): void {
    const dialogRef = this.dialogBuilder.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('TASKS.CONFIRM-DELETE', {name: this.task.title})
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) {
        return;
      }

      if (result.action === DialogAction.OK) {
        this.dialogRef.close(new DialogResult(DialogAction.DELETE));
      }
    });
  }

  complete(): void {
    this.dialogRef.close(new DialogResult(DialogAction.COMPLETE));
  }

  activate(): void {
    this.dialogRef.close(new DialogResult(DialogAction.ACTIVATE));
  }

  private findPriorityById(tmpPriorityId: number): Priority {
    return this.priorities.find(t => t.id === tmpPriorityId);
  }

  private findCategoryById(tmpCategoryId: number): Category {
    return this.categories.find(t => t.id === tmpCategoryId);
  }

  addDays(days: number): void {
    this.newDate = new Date();
    this.newDate.setDate(this.today.getDate() + days);
  }

  setToday(): void {
    this.newDate = this.today;
  }
}
