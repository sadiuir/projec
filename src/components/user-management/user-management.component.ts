
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/project.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  templateUrl: './user-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class UserManagementComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  users = this.authService.users;
  showSuccessMessage = signal(false);

  userForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Admin Lapangan' as User['role'], Validators.required],
  });

  onSubmit() {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      this.authService.createUser({
        username: formValue.username!,
        password: formValue.password!,
        role: formValue.role!,
      });
      this.userForm.reset({ role: 'Admin Lapangan' });
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 2000);
    }
  }

  getRoleColor(role: User['role']) {
    switch(role) {
      case 'Super Admin': return 'bg-red-100 text-red-800';
      case 'Admin Kantor': return 'bg-purple-100 text-purple-800';
      case 'Admin Lapangan': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}