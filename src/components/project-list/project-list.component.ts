
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  templateUrl: './project-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
})
export class ProjectListComponent {
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  
  projects = this.projectService.projects;
  currentUser = this.authService.currentUser;

  importError = signal<string | null>(null);
  importSuccess = signal<boolean>(false);

  getStatusColor(status: Project['status']): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getProgressBarColor(progress: number): string {
    if (progress < 40) return 'bg-yellow-500';
    if (progress < 75) return 'bg-blue-500';
    return 'bg-green-500';
  }

  onFileSelected(event: Event): void {
    this.importError.set(null);
    this.importSuccess.set(false);

    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.type !== 'text/csv') {
        this.importError.set('Invalid file type. Please upload a CSV file.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
          this.projectService.importProjectsFromCsv(text);
          this.importSuccess.set(true);
          setTimeout(() => this.importSuccess.set(false), 3000);
        } catch (error) {
          this.importError.set('Failed to parse or import CSV file. Please check the format.');
        }
      };
      reader.readAsText(file);
    }
  }
}