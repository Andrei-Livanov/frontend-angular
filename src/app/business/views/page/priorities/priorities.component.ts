import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Priority} from '../../../data/model/Priority';
import {User} from '../../../../auth/service/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {DeviceDetectorService} from 'ngx-device-detector';
import {EditPriorityDialogComponent} from '../../dialog/edit-priority-dialog/edit-priority-dialog.component';
import {DialogAction} from '../../../object/DialogResult';

@Component({
  selector: 'app-priorities',
  templateUrl: './priorities.component.html',
  styleUrls: ['./priorities.component.css']
})
export class PrioritiesComponent implements OnInit {

  static defaultColor = '#fcfcfc';

  @Input()
  priorities: [Priority];

  @Input()
  user: User;

  @Output()
  addPriorityEvent = new EventEmitter<Priority>();

  @Output()
  updatePriorityEvent = new EventEmitter<Priority>();

  @Output()
  deletePriorityEvent = new EventEmitter<Priority>();

  isMobile: boolean;

  constructor(
    private dialogBuilder: MatDialog,
    private translate: TranslateService,
    private deviceService: DeviceDetectorService
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  ngOnInit(): void {
  }

  openAddDialog(): void {
    const dialogRef = this.dialogBuilder.open(EditPriorityDialogComponent, {
      data: [new Priority(null, '', PrioritiesComponent.defaultColor, this.user),
        this.translate.instant('PRIORITY.ADDING')],
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) {
        return;
      }

      if (result.action === DialogAction.SAVE) {
        const newPriority = result.obj as Priority;
        this.addPriorityEvent.emit(newPriority);
      }
    });
  }

  openEditDialog(priority: Priority): void {
    const dialogRef = this.dialogBuilder.open(EditPriorityDialogComponent, {
      data: [new Priority(priority.id, priority.title, priority.color, this.user),
        this.translate.instant('PRIORITY.EDITING')]
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) {
        return;
      }

      if (result.action === DialogAction.DELETE) {
        this.deletePriorityEvent.emit(priority);
        return;
      }

      if (result.action === DialogAction.SAVE) {
        priority = result.obj as Priority;
        this.addPriorityEvent.emit(priority);
        return;
      }
    });
  }

  openDeleteDialog(priority: Priority): void {
    const dialogRef = this.dialogBuilder.open(EditPriorityDialogComponent, {
      maxWidth: '500',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('PRIORITY.CONFIRM-DELETE', {name: priority.title})
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) {
        return;
      }

      if (result.action === DialogAction.OK) {
        this.deletePriorityEvent.emit(priority);
      }
    });
  }
}
