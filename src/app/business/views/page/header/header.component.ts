import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AuthService, User} from '../../../../auth/service/auth.service';
import {MatDialog} from '@angular/material/dialog';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Priority} from '../../../data/model/Priority';
import {SettingsDialogComponent} from '../../dialog/settings-dialog/settings-dialog.component';
import {DialogAction} from '../../../object/DialogResult';
import {IntroService} from '../../../intro/intro.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @Input()
  categoryName: string;

  @Input()
  user: User;

  @Input()
  showStat: boolean;

  @Input()
  showMobileSearch: boolean;

  @Output()
  toggleMenuEvent = new EventEmitter();

  @Output()
  toggleStatEvent = new EventEmitter<boolean>();

  @Output()
  settingsChangedEvent = new EventEmitter<Priority[]>();

  @Output()
  toggleMobileSearchEvent = new EventEmitter<boolean>();

  isMobile: boolean;

  constructor(
    private dialogBuilder: MatDialog,
    private deviceService: DeviceDetectorService,
    private auth: AuthService,
    private introService: IntroService
  ) {
    this.isMobile = deviceService.isMobile();
  }

  ngOnInit(): void {
  }

  onToggleMenu(): void {
    this.toggleMenuEvent.emit();
  }

  onToggleStat(): void {
    this.toggleStatEvent.emit(!this.showStat);
  }

  logout(): void {
    this.auth.logout();
  }

  showSettings(): void {
    const dialogRef = this.dialogBuilder.open(SettingsDialogComponent, {
      autoFocus: false,
      width: '600px',
      minHeight: '300px',
      data: [this.user],
      maxHeight: '90vh'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === DialogAction.SETTINGS_CHANGE) {
        this.settingsChangedEvent.emit(result.obj);
        return;
      }
    });
  }

  onToggleMobileSearch(): void {
    this.toggleMobileSearchEvent.emit(!this.showMobileSearch);
  }

  showIntroHelp(): void {
    this.introService.startIntroJS();
  }
}
