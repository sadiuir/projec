
import { Injectable, signal } from '@angular/core';
import { Project, ProgressUpdate } from '../models/project.model';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private _projects = signal<Project[]>([]);
  public projects = this._projects.asReadonly();

  constructor() {
    // Initialize with construction-specific mock data
    if (this._projects().length === 0) {
      this._projects.set([
        {
          id: 'proj-1',
          name: 'Pembangunan Jembatan Merah Putih II',
          description: 'Pembangunan jembatan gantung baru untuk menghubungkan dua kabupaten, meningkatkan konektivitas dan perekonomian regional.',
          startDate: '2024-03-15',
          endDate: '2025-08-30',
          status: 'In Progress',
          progress: 35,
          workVolume: '1 Jembatan (500m)',
          totalCost: 15000000000,
          assignedFieldAdminUsername: 'lapangan', // Assigned to this field admin
          updates: [
            { id: 'up-1-1', date: '2024-06-20', author: 'Admin Lapangan', summary: 'Pekerjaan pondasi pilar utama selesai.', workDescription: 'Pengecoran beton K-350 untuk pilar P1 dan P2 telah selesai 100%. Menunggu hasil uji tekan beton.', progressMade: 20, verified: true },
            { id: 'up-1-2', date: '2024-07-25', author: 'Admin Lapangan', summary: 'Fabrikasi rangka baja dek utama.', workDescription: 'Fabrikasi segmen pertama dari rangka baja jembatan sedang berlangsung di workshop. Progres 15%.', progressMade: 15, verified: false },
          ]
        },
        {
          id: 'proj-2',
          name: 'Renovasi Stadion Gelora Nusantara',
          description: 'Modernisasi stadion utama termasuk penggantian rumput, peningkatan kapasitas tempat duduk, dan perbaikan fasilitas M&E.',
          startDate: '2024-05-01',
          endDate: '2024-12-01',
          status: 'In Progress',
          progress: 60,
          workVolume: '1 Stadion',
          totalCost: 8500000000,
          updates: [
            { id: 'up-2-1', date: '2024-07-10', author: 'Super Admin', summary: 'Penggantian rumput lapangan selesai.', workDescription: 'Rumput Zoysia Matrella telah terpasang di seluruh area lapangan utama. Sistem drainase juga sudah diuji.', progressMade: 40, verified: true },
             { id: 'up-2-2', date: '2024-08-05', author: 'Admin Kantor', summary: 'Pemasangan kursi tribun tahap 1.', workDescription: 'Pemasangan 10.000 kursi baru di tribun timur telah selesai.', progressMade: 20, verified: true },
          ]
        },
        {
          id: 'proj-3',
          name: 'Pembangunan Rusunawa Cendana',
          description: 'Membangun satu tower rumah susun sewa untuk masyarakat berpenghasilan rendah, terdiri dari 15 lantai dan 250 unit.',
          startDate: '2024-08-01',
          endDate: '2025-11-15',
          status: 'Not Started',
          progress: 0,
          workVolume: '1 Tower (250 unit)',
          totalCost: 45000000000,
          updates: []
        },
        {
            id: 'proj-4',
            name: 'Proyek Irigasi Sawah Makmur',
            description: 'Perbaikan dan pembangunan saluran irigasi primer dan sekunder untuk mengairi 500 hektar sawah.',
            startDate: '2024-04-01',
            endDate: '2024-09-30',
            status: 'Completed',
            progress: 100,
            workVolume: 'Saluran irigasi 15km',
            totalCost: 5000000000,
            assignedFieldAdminUsername: 'lapangan',
            updates: [
                { id: 'up-4-1', date: '2024-07-15', author: 'Admin Lapangan', summary: 'Penggalian saluran primer selesai.', workDescription: 'Penggalian tanah untuk saluran primer sepanjang 5km telah mencapai 100%.', progressMade: 50, verified: true },
                { id: 'up-4-2', date: '2024-08-20', author: 'Admin Lapangan', summary: 'Pemasangan lining beton saluran.', workDescription: 'Pemasangan lining beton pracetak untuk mencegah kebocoran telah selesai di semua saluran.', progressMade: 50, verified: true },
            ]
        }
      ]);
    }
  }

  addProject(projectData: Omit<Project, 'id' | 'progress' | 'updates' | 'status'>) {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      progress: 0,
      updates: [],
      status: 'Not Started'
    };
    this._projects.update(projects => [...projects, newProject]);
  }

  addProgressUpdate(projectId: string, updateData: Omit<ProgressUpdate, 'id' | 'date' | 'verified'>) {
    this._projects.update(projects => 
      projects.map(p => {
        if (p.id === projectId) {
          const newUpdate: ProgressUpdate = {
            ...updateData,
            id: `up-${p.id}-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            verified: false
          };

          const newProgress = Math.min(100, p.progress + updateData.progressMade);
          const newStatus = newProgress === 100 ? 'Completed' : 'In Progress';

          return {
            ...p,
            progress: newProgress,
            status: newStatus,
            updates: [newUpdate, ...p.updates]
          };
        }
        return p;
      })
    );
  }

  verifyUpdate(projectId: string, updateId: string) {
    this._projects.update(projects => 
      projects.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            updates: p.updates.map(u => u.id === updateId ? { ...u, verified: true } : u)
          };
        }
        return p;
      })
    );
  }

  addDailyReportAndUpdateProject(projectId: string, reportData: { summary: string; author: string; workDescription: string; photo?: string; workVolume?: string; totalCost?: number; progressMade: number; }) {
      this._projects.update(projects => 
          projects.map(p => {
              if (p.id === projectId) {
                  const newUpdate: ProgressUpdate = {
                      id: `up-${p.id}-${Date.now()}`,
                      date: new Date().toISOString().split('T')[0],
                      summary: reportData.summary,
                      author: reportData.author,
                      workDescription: reportData.workDescription,
                      photo: reportData.photo,
                      progressMade: reportData.progressMade,
                      verified: false
                  };

                  const newProgress = Math.min(100, p.progress + reportData.progressMade);
                  const newStatus = newProgress >= 100 ? 'Completed' : 'In Progress';

                  return {
                      ...p,
                      workVolume: reportData.workVolume ?? p.workVolume,
                      totalCost: reportData.totalCost ?? p.totalCost,
                      progress: newProgress,
                      status: newStatus,
                      updates: [newUpdate, ...p.updates]
                  };
              }
              return p;
          })
      );
  }

  importProjectsFromCsv(csvContent: string) {
    const lines = csvContent.split('\n').slice(1); // Skip header
    const newProjects: Project[] = [];
    for (const line of lines) {
      if (!line) continue;
      const [name, description, startDate, endDate, workVolume, totalCost, assignedFieldAdminUsername] = line.split(',');
      if (name && description && startDate && endDate && workVolume && totalCost) {
        newProjects.push({
          id: `proj-${Date.now()}-${Math.random()}`,
          name: name.trim(),
          description: description.trim(),
          startDate: startDate.trim(),
          endDate: endDate.trim(),
          status: 'Not Started',
          progress: 0,
          updates: [],
          workVolume: workVolume.trim(),
          totalCost: parseFloat(totalCost.trim()),
          assignedFieldAdminUsername: assignedFieldAdminUsername?.trim() || undefined
        });
      }
    }
    this._projects.update(currentProjects => [...currentProjects, ...newProjects]);
  }

  updateProjectStatus(projectId: string, status: Project['status']) {
    this._projects.update(projects =>
      projects.map(p => {
        if (p.id === projectId) {
          const progress = status === 'Completed' ? 100 : (p.progress === 100 ? 99 : p.progress);
          return { ...p, status: status, progress: status === 'Not Started' ? 0 : progress };
        }
        return p;
      })
    );
  }
}