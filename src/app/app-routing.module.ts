import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './auth/login/login.component';
import {RegisterComponent} from './auth/register/register.component';
import {InfoPageComponent} from './auth/info-page/info-page.component';
import {ActivateAccountComponent} from './auth/activate-account/activate-account.component';
import {SendEmailResetPasswordComponent} from './auth/reset-password/send-email/send-email-reset-password.component';
import {UpdatePasswordComponent} from './auth/reset-password/update/update-password.component';
import {MainComponent} from './business/views/page/main/main.component';
import {RolesGuard} from './business/guard/roles-guard.service';
import {AccessDeniedComponent} from './auth/access-denied/access-denied.component';


const routes: Routes = [
  {path: '', component: LoginComponent},
  {path: 'logout', redirectTo: '', pathMatch: 'full'},
  {path: 'index', redirectTo: '', pathMatch: 'full'},

  {path: 'register', component: RegisterComponent, pathMatch: 'full'},
  {path: 'reset-password', component: SendEmailResetPasswordComponent},
  {path: 'info-page', component: InfoPageComponent},

  {
    path: 'main', component: MainComponent, canActivate: [RolesGuard],
    data: {
      allowedRoles: ['ADMIN', 'USER']
    }
  },

  {path: 'activate-account/:uuid', component: ActivateAccountComponent},
  {path: 'update-password/:token', component: UpdatePasswordComponent},
  {path: 'access-denied', component: AccessDeniedComponent},
  {path: '**', redirectTo: '/'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
