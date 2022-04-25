import {Component, Inject, OnInit} from '@angular/core';
import {Priority} from '../../../data/model/Priority';
import {LANG_EN, LANG_RU} from '../../page/main/main.component';
import {User} from '../../../../auth/service/auth.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {PriorityService} from '../../../data/dao/impl/PriorityService';
import {TranslateService} from '@ngx-translate/core';
import {DialogAction, DialogResult} from '../../../object/DialogResult';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit {

  priorities: Priority[];
  settingsChanged = false;
  lang: string;
  user: User;
  isLoading: boolean;

  en = LANG_EN;
  ru = LANG_RU;

  constructor(
    private dialogRef: MatDialogRef<SettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: [User],
    private priorityService: PriorityService,
    private translate: TranslateService
  ) {
    this.lang = translate.currentLang;
  }

  ngOnInit(): void {
    this.user = this.data[0];
    this.loadPriorities();
  }

  private loadPriorities(): void {
    this.isLoading = true;
    this.priorityService.findAll(this.user.email).subscribe(priorities => {
      this.priorities = priorities;
      this.isLoading = false;
    });
  }

  close(): void {
    if (this.settingsChanged) {
      this.dialogRef.close(new DialogResult(DialogAction.SETTINGS_CHANGE, this.priorities));
    } else {
      this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
    }
  }

  addPriority(priority: Priority): void {
    priority.user = this.user;
    this.settingsChanged = true;

    this.priorityService.add(priority).subscribe(result => {
      this.priorities.push(result);
    });
  }

  deletePriority(priority: Priority): void {
    this.settingsChanged = true;

    this.priorityService.delete(priority.id).subscribe(() => {
      this.priorities.splice(this.getPriorityIndex(priority), 1);
    });
  }

  updatePriority(priority: Priority): void {
    this.settingsChanged = true;

    this.priorityService.update(priority).subscribe(() => {
      this.priorities[this.getPriorityIndex(priority)] = priority;
    });
  }

  getPriorityIndex(priority: Priority): number {
    const tmpPriority = this.priorities.find(t => t.id === priority.id);
    return this.priorities.indexOf(tmpPriority);
  }

  langChanged(): void {
    this.translate.use(this.lang);
    this.settingsChanged = true;
  }
}
