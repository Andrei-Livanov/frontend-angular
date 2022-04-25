import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {Category} from '../../../data/model/Category';
import {TranslateService} from '@ngx-translate/core';
import {DialogAction, DialogResult} from '../../../object/DialogResult';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-category-dialog',
  templateUrl: './edit-category-dialog.component.html',
  styleUrls: ['./edit-category-dialog.component.css']
})
export class EditCategoryDialogComponent implements OnInit {

  dialogTitle: string;
  category: Category;
  canDelete = false;

  constructor(private dialogRef: MatDialogRef<EditCategoryDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: [Category, string],
              private dialogBuilder: MatDialog,
              private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.category = this.data[0];
    this.dialogTitle = this.data[1];

    if (this.category && this.category.id && this.category.id > 0) {
      this.canDelete = true;
    }
  }

  confirm(): void {
    if (!this.category.title || this.category.title.trim().length === 0) {
      return;
    }

    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.category));
  }

  cancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  delete(): void {
    const dialogRef = this.dialogBuilder.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: this.translate.instant('COMMON.CONFIRM'),
        message: this.translate.instant('CATEGORY.CONFIRM-DELETE', {name: this.category.title})
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
