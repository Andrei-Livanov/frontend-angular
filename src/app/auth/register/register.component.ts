import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService, User} from '../service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

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
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get usernameField(): AbstractControl {
    return this.form.get('username');
  }

  get emailField(): AbstractControl {
    return this.form.get('email');
  }

  get passwordField(): AbstractControl {
    return this.form.get('password');
  }

  get confirmPasswordField(): AbstractControl {
    return this.form.get('confirmPassword');
  }

  public submitForm(): void {
    this.firstSubmitted = true;

    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    const user = new User();
    user.username = this.usernameField.value;
    user.email = this.emailField.value;
    user.password = this.passwordField.value;

    this.authService.register(user).subscribe(() => {
        this.isLoading = false;
        this.error = null;
        this.router.navigate(['/info-page',
          {msg: 'Вам отправлено письмо для подтверждения аккаунта. Проверьте почту через 1-2 мин.'}]);
      },
      err => {
        this.isLoading = false;
        switch (err.error.exception) {
          case 'DataIntegrityViolationException': {
            this.error = 'Такой пользователь или email уже существует';
            break;
          }
          case 'ConstraintViolationException': {
            this.error = 'Такой пользователь или email уже существует';
            break;
          }
          case 'UserOrEmailAlreadyExistException': {
            this.error = 'Такой пользователь или email уже существует';
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
