import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-send-email-reset-password',
  templateUrl: './send-email-reset-password.component.html',
  styleUrls: ['./send-email-reset-password.component.css']
})
export class SendEmailResetPasswordComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  error: string;
  firstSubmitted = false;
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

    this.authService.sendResetPasswordEmail(this.emailField.value).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/info-page',
          {msg: 'Вам отправлено письмо для восстановления пароля, проверьте почту через 1-2 мин.'}]);
      },
      err => {
        this.isLoading = false;
        switch (err.error.exception) {
          case 'UsernameNotFoundException': {
            this.error = 'Пользователя с таким email не существует';
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
