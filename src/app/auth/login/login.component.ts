import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AuthService, User} from '../service/auth.service';
import {Router} from '@angular/router';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  user: User;
  error: string;
  firstSubmitted = false;
  isLoading = false;
  showResendLink = false;
  isMobile: boolean;

  constructor(private formBuilder: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private deviceService: DeviceDetectorService) {
  }

  ngOnInit(): void {
    this.isMobile = this.deviceService.isMobile();

    this.form = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get usernameField(): AbstractControl {
    return this.form.get('username');
  }

  get passwordField(): AbstractControl {
    return this.form.get('password');
  }

  public submitForm(): void {
    this.firstSubmitted = true;

    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    const tmpUser = new User();
    tmpUser.username = this.usernameField.value;
    tmpUser.password = this.passwordField.value;

    this.authService.login(tmpUser).subscribe(result => {
        this.isLoading = false;
        this.user = result;

        this.authService.currentUser.next(this.user);
        this.authService.isLoggedIn = true;

        this.router.navigate(['main']);
      },
      err => {
        this.isLoading = false;
        switch (err.error.exception) {
          case 'BadCredentialsException': {
            this.error = 'Ошибка: проверьте логин или пароль';
            break;
          }
          case 'DisabledException': {
            this.error = 'Пользователь не активирован';
            this.showResendLink = true;
            break;
          }
          default: {
            this.error = 'Ошибка (обратитесь к администратору)';
            break;
          }
        }
      });
  }
}
