
export interface ProgressUpdate {
  id: string;
  date: string;
  author: string;
  summary: string;
  workDescription?: string; // Description of work done
  photo?: string; // Base64 encoded image
  progressMade: number; // Percentage points added in this update
  verified: boolean;
}

export interface Project {
  id:string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number; // Overall progress from 0 to 100
  updates: ProgressUpdate[];
  workVolume: string;
  totalCost: number;
  assignedFieldAdminUsername?: string;
}

export interface User {
  username: string;
  password?: string;
  name: string;
  role: 'Super Admin' | 'Admin Kantor' | 'Admin Lapangan';
}