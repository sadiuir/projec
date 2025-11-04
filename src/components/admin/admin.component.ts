
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminComponent {
  private fb = inject(FormBuilder);
  private projectService = inject(ProjectService);
  // FIX: Explicitly type the injected Router instance to resolve type inference issue.
  private router: Router = inject(Router);

  showSuccessMessage = signal(false);

  projectForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    workVolume: ['', Validators.required],
    totalCost: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  onSubmit() {
    if (this.projectForm.valid) {
      const formValue = this.projectForm.value;
      this.projectService.addProject({
        name: formValue.name!,
        description: formValue.description!,
        startDate: formValue.startDate!,
        endDate: formValue.endDate!,
        workVolume: formValue.workVolume!,
        totalCost: formValue.totalCost!,
      });
      this.projectForm.reset();
      this.showSuccessMessage.set(true);
      setTimeout(() => {
        this.showSuccessMessage.set(false);
        this.router.navigate(['/projects']);
      }, 2000);
    }
  }
}