
import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { AdminComponent } from './components/admin/admin.component';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

const authGuard = () => {
  const authService = inject(AuthService);
  // FIX: Explicitly type the injected Router instance to resolve type inference issue.
  const router: Router = inject(Router);
  if (authService.isAuthenticated()) {
    return true;
  }
  return router.parseUrl('/login');
};

const superAdminGuard = () => {
  const authService = inject(AuthService);
  const router: Router = inject(Router);
  return authService.currentUser()?.role === 'Super Admin' ? true : router.parseUrl('/projects');
};

// Admin page is accessible by Super Admin and Office Admin
const adminAccessGuard = () => {
    const authService = inject(AuthService);
    const router: Router = inject(Router);
    const role = authService.currentUser()?.role;
    return (role === 'Super Admin' || role === 'Admin Kantor') ? true : router.parseUrl('/projects');
}


export const APP_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'projects', 
    component: ProjectListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'project/:id', 
    component: ProjectDetailComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [authGuard, adminAccessGuard]
  },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [authGuard, superAdminGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];