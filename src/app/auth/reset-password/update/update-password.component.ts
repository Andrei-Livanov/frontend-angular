import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../../service/auth.service';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.css']
})
export class UpdatePasswordComponent implements OnInit {

  form: FormGroup;
  isLoading = false;
  error: string;
  showPasswordForm = false;
  token: string;
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
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.route.params.subscribe(params => {
      this.token = params.token;
      this.showPasswordForm = true;
    });
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

    this.authService.updatePassword(this.passwordField.value, this.token).subscribe(result => {
        this.isLoading = false;

        if (result) {
          this.router.navigate(['/info-page', {msg: 'Пароль успешно обновлён.'}]);
        }
      },
      () => {
        this.isLoading = false;
        this.router.navigate(['/info-page',
          {msg: 'Ошибка при обновлении пароля. Возможно вышел срок действия страницы. Запросите пароль заново.'}]);
      });
  }
}
