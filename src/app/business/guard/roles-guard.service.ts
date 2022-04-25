import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from '../../auth/service/auth.service';
import {catchError, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RolesGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isLoggedIn) {
      return this.userHasRequiredRole(this.authService.currentUser.getValue().roles, next.data.allowedRoles);
    }

    return this.authService.autoLogin().pipe(
      map(result => {
        if (result) {
          const user = result;
          this.authService.currentUser.next(user);
          this.authService.isLoggedIn = true;

          return this.userHasRequiredRole(user.roles, next.data.allowedRoles);
        } else {
          this.router.navigateByUrl('');
          return false;
        }
      }),
      catchError(err => {
        console.log(err);
        this.router.navigateByUrl('');
        return of(false);
      })
    );
  }

  private userHasRequiredRole(userRoles: Array<any>, allowedRoles: Array<string>): boolean {
    for (const r of allowedRoles) {
      if (userRoles.find(e => e.name === r)) {
        return true;
      }
    }

    this.router.navigate(['/access-denied']);
    return false;
  }
}
