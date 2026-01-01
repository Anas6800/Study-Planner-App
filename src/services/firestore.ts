import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Subject, StudyEvent } from '../types/subjects';

// Subjects collection: users/{userId}/subjects
export const subjectsService = {
  // Create a new subject
  async createSubject(userId: string, subjectData: Omit<Subject, 'id' | 'createdAt' | 'userId'>) {
    const subjectsRef = collection(db, 'users', userId, 'subjects');
    const docRef = await addDoc(subjectsRef, {
      ...subjectData,
      targetDate: Timestamp.fromDate(subjectData.targetDate),
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  // Get all subjects for a user
  async getSubjects(userId: string): Promise<Subject[]> {
    const subjectsRef = collection(db, 'users', userId, 'subjects');
    const q = query(subjectsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        targetDate: (data.targetDate as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate()
      } as Subject;
    });
  },

  // Update a subject
  async updateSubject(userId: string, subjectId: string, updates: Partial<Subject>) {
    const subjectRef = doc(db, 'users', userId, 'subjects', subjectId);
    const updateData: any = { ...updates };
    
    if (updates.targetDate) {
      updateData.targetDate = Timestamp.fromDate(updates.targetDate);
    }
    
    await updateDoc(subjectRef, updateData);
  },

  // Delete a subject
  async deleteSubject(userId: string, subjectId: string) {
    const subjectRef = doc(db, 'users', userId, 'subjects', subjectId);
    await deleteDoc(subjectRef);
  },

  // Get a single subject
  async getSubject(userId: string, subjectId: string): Promise<Subject | null> {
    const subjectRef = doc(db, 'users', userId, 'subjects', subjectId);
    const docSnap = await getDoc(subjectRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        targetDate: (data.targetDate as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp).toDate()
      } as Subject;
    }
    return null;
  }
};

// Study Events collection: users/{userId}/studyEvents
export const studyEventsService = {
  // Create a new study event
  async createStudyEvent(userId: string, eventData: Omit<StudyEvent, 'id' | 'userId'>) {
    const eventsRef = collection(db, 'users', userId, 'studyEvents');
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      start: Timestamp.fromDate(eventData.start),
      end: Timestamp.fromDate(eventData.end)
    });
    return docRef.id;
  },

  // Get all study events for a user
  async getStudyEvents(userId: string): Promise<StudyEvent[]> {
    const eventsRef = collection(db, 'users', userId, 'studyEvents');
    const q = query(eventsRef, orderBy('start', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start: (data.start as Timestamp).toDate(),
        end: (data.end as Timestamp).toDate()
      } as StudyEvent;
    });
  },

  // Get study events for a specific date range
  async getStudyEventsInRange(userId: string, start: Date, end: Date): Promise<StudyEvent[]> {
    const eventsRef = collection(db, 'users', userId, 'studyEvents');
    const q = query(
      eventsRef,
      where('start', '>=', Timestamp.fromDate(start)),
      where('start', '<=', Timestamp.fromDate(end)),
      orderBy('start', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        start: (data.start as Timestamp).toDate(),
        end: (data.end as Timestamp).toDate()
      } as StudyEvent;
    });
  },

  // Update a study event
  async updateStudyEvent(userId: string, eventId: string, updates: Partial<StudyEvent>) {
    const eventRef = doc(db, 'users', userId, 'studyEvents', eventId);
    const updateData: any = { ...updates };
    
    if (updates.start) {
      updateData.start = Timestamp.fromDate(updates.start);
    }
    if (updates.end) {
      updateData.end = Timestamp.fromDate(updates.end);
    }
    
    await updateDoc(eventRef, updateData);
  },

  // Delete a study event
  async deleteStudyEvent(userId: string, eventId: string) {
    const eventRef = doc(db, 'users', userId, 'studyEvents', eventId);
    await deleteDoc(eventRef);
  }
};
