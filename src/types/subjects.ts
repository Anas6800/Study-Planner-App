export interface Subject {
  id: string;
  name: string;
  description?: string;
  targetHours: number;
  completedHours: number;
  targetDate: Date;
  createdAt: Date;
  userId: string;
}

export interface StudyEvent {
  id: string;
  subjectId: string;
  title: string;
  start: Date;
  end: Date;
  hours: number;
  userId: string;
  notes?: string;
}
