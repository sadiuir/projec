
import { Component, ChangeDetectionStrategy, inject, computed, input, signal, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Project, ProgressUpdate } from '../../models/project.model';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  templateUrl: './project-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
})
export class ProjectDetailComponent implements OnDestroy {
  id = input.required<string>();
  
  @ViewChild('videoPlayer') videoPlayer: ElementRef<HTMLVideoElement> | undefined;

  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  project = computed(() => {
    const projId = this.id();
    return this.projectService.projects().find(p => p.id === projId);
  });
  
  currentUser = this.authService.currentUser;

  canHandleProject = computed(() => {
    const user = this.currentUser();
    const proj = this.project();
    if (!user || !proj) return false;

    if (user.role === 'Super Admin' || user.role === 'Admin Kantor') {
      return true;
    }
    if (user.role === 'Admin Lapangan') {
      return user.username === proj.assignedFieldAdminUsername;
    }
    return false;
  });

  completionDate = computed(() => {
    const project = this.project();
    if (!project || project.status !== 'Completed' || project.updates.length === 0) return null;
    
    const latestUpdate = project.updates.reduce((latest, current) => {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
    return latestUpdate.date;
  });

  monthlyReports = computed(() => {
    const project = this.project();
    if (!project || !project.updates) return new Map<string, ProgressUpdate[]>();

    const grouped = new Map<string, ProgressUpdate[]>();
    const sortedUpdates = [...project.updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    for (const update of sortedUpdates) {
        const date = new Date(update.date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!grouped.has(monthYear)) {
            grouped.set(monthYear, []);
        }
        grouped.get(monthYear)!.push(update);
    }
    return grouped;
  });

  
  projectStatuses: Project['status'][] = ['Not Started', 'In Progress', 'On Hold', 'Completed'];

  isCameraOpen = signal(false);
  capturedImage = signal<string | null>(null);
  private stream: MediaStream | null = null;


  // Form for daily reports (Field Admin, but available to others with rights)
  dailyReportForm = this.fb.group({
    summary: ['', Validators.required],
    workDescription: ['', Validators.required],
    workVolume: [''],
    totalCost: [null as number | null, Validators.min(0)],
    progressMade: [null as number | null, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  onDailyReportSubmit() {
    if (this.dailyReportForm.valid && this.canHandleProject()) {
        const formValue = this.dailyReportForm.value;
        this.projectService.addDailyReportAndUpdateProject(this.id(), {
            summary: formValue.summary!,
            author: this.currentUser()!.name,
            workDescription: formValue.workDescription!,
            photo: this.capturedImage() ?? undefined,
            workVolume: formValue.workVolume || undefined,
            totalCost: formValue.totalCost || undefined,
            progressMade: formValue.progressMade!,
        });
        this.dailyReportForm.reset();
        this.clearPhoto();
    }
  }

  verifyUpdate(updateId: string) {
    this.projectService.verifyUpdate(this.id(), updateId);
  }
  
  changeProjectStatus(status: Project['status']) {
    this.projectService.updateProjectStatus(this.id(), status);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.capturedImage.set(reader.result as string);
        this.closeCamera(); // Close camera if a file is selected
      };
      reader.readAsDataURL(file);
    }
  }

  async openCamera() {
    this.closeCamera(); // Close any existing stream
    this.clearPhoto();
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      this.isCameraOpen.set(true);
       setTimeout(() => {
        if (this.videoPlayer && this.stream) {
          this.videoPlayer.nativeElement.srcObject = this.stream;
        }
      }, 0);
    } catch (err) {
      console.error("Error accessing camera: ", err);
      // Handle error (e.g., show a message to the user)
    }
  }
  
  capturePhoto() {
    if (!this.videoPlayer) return;
    const video = this.videoPlayer.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    this.capturedImage.set(canvas.toDataURL('image/jpeg'));
    this.closeCamera();
  }

  clearPhoto() {
    this.capturedImage.set(null);
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  closeCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    this.isCameraOpen.set(false);
    this.stream = null;
  }

  ngOnDestroy() {
    this.closeCamera();
  }

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

  exportToCsv() {
    const project = this.project();
    if (!project || project.updates.length === 0) return;

    const headers = ['Date', 'Author', 'Summary', 'Work Description', 'Progress Added (%)', 'Verified'];
    const rows = project.updates.map(u => 
        [
          u.date,
          u.author,
          `"${u.summary.replace(/"/g, '""')}"`,
          `"${u.workDescription?.replace(/"/g, '""') ?? ''}"`,
          u.progressMade,
          u.verified
        ].join(',')
    );

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${project.name}_progress_report.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}