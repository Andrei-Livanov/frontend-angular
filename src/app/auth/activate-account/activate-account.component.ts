import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../service/auth.service';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-activate-account',
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})
export class ActivateAccountComponent implements OnInit {

  form: FormGroup;
  uuid: string;
  isLoading = true;
  error: string;
  firstSubmitted = false;
  showResendLink = false;
  isMobile: boolean;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private deviceService: DeviceDetectorService) {
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.route.params.subscribe(params => {
      this.uuid = params.uuid;

      if (this.uuid === 'error') {
        this.showResendLink = true;
      }

      this.isLoading = true;

      this.authService.activateAccount(this.uuid).subscribe(result => {
          this.isLoading = false;

          if (result) {
            this.router.navigate(['/info-page', {msg: 'Ваш аккаунт успешно активирован.'}]);
          } else {
            this.router.navigate(['/info-page', {msg: 'Ваш аккаунт не активирован. Попробуйте заново.'}]);
          }
        },
        err => {
          this.isLoading = false;
          switch (err.error.exception) {
            case 'UserAlreadyActivatedException': {
              this.router.navigate(['/info-page', {msg: 'Ваш аккаунт уже был активирован ранее.'}]);
              break;
            }
            default: {
              this.error = 'Ошибка активации. Попробуйте заново отправить письмо активации.';
              this.showResendLink = true;
              break;
            }
          }
        });
    });
  }

  get emailField(): AbstractControl {
    return this.form.get('email');
  }

  public submitForm(): void {
    this.firstSubmitted = true;

    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    this.authService.resendActivateEmail(this.emailField.value).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/info-page', {msg: 'Вам отправлено письмо активации.'}]);
      },
      err => {
        this.isLoading = false;
        switch (err.error.exception) {
          case 'UserAlreadyActivatedException': {
            this.router.navigate(['/info-page', {msg: 'Ваш аккаунт уже был активирован ранее.'}]);
            break;
          }
          case 'UsernameNotFoundException': {
            this.error = 'Пользователь с таким email не найден';
            break;
          }
          default: {
            this.error = 'Ошибка';
            break;
          }
        }
      });
  }
}
