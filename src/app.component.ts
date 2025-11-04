
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
})
export class AppComponent {
  authService = inject(AuthService);
  // FIX: Explicitly type the injected Router instance to resolve type inference issue.
  private router: Router = inject(Router);
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}