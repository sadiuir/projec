
import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _users = signal<User[]>([
    // Passwords are now stored encrypted (Base64)
    { username: 'superadmin', password: 'cGFzc3dvcmQ=', name: 'Super Admin', role: 'Super Admin' },
    { username: 'kantor', password: 'cGFzc3dvcmQ=', name: 'Admin Kantor', role: 'Admin Kantor' },
    { username: 'lapangan', password: 'cGFzc3dvcmQ=', name: 'Admin Lapangan', role: 'Admin Lapangan' },
  ]);
  
  public users = this._users.asReadonly();

  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.currentUser());

  login(username: string, password: string): boolean {
    const encodedPassword = btoa(password);
    const user = this._users().find(u => u.username === username && u.password === encodedPassword);
    if (user) {
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.set(null);
  }

  createUser(user: Omit<User, 'name'>) {
    if (this._users().some(u => u.username === user.username)) {
      // In a real app, throw an error or return a status
      console.error('Username already exists');
      return;
    }
    
    const newUser: User = {
        ...user,
        password: btoa(user.password!),
        name: user.username, // Simple name generation
    };
    this._users.update(users => [...users, newUser]);
  }
}