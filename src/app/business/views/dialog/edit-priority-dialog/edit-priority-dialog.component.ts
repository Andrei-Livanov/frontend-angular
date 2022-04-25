import {Component, Inject, OnInit} from '@angular/core';
import {Priority} from '../../../data/model/Priority';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {TranslateService} from '@ngx-translate/core';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-priority-dialog',
  templateUrl: './edit-priority-dialog.component.html',
  styleUrls: ['./edit-priority-dialog.component.css']
})
export class EditPriorityDialogComponent implements OnInit {

  dialogTitle: string;
  priority: Priority;
  canDelete = false;

  constructor(
    private dialogRef: MatDialogRef<EditPriorityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: [Priority, string],
    private dialogBuilder: MatDialog,
    private translate: TranslateService
  ) {
  }

  ngOnInit(): void {
    this.priority = this.data[0];
    this.dialogTitle = this.data[1];

    if (this.priority && this.priority.id > 0) {
      this.canDelete = true;
    }
  }

  confirm(): void {
    if (!this.priority.title || this.priority.title.trim().length === 0) {
      return;
    }

    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.priority));
  }

  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  delete(): void {
    const dialogRef = this.dialogBuilder.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('PRIORITY.CONFIRM-DELETE', {name: this.priority.title})
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
}
