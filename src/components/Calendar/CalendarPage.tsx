import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../../contexts/AuthContext';
import { subjectsService, studyEventsService } from '../../services/firestore';
import { Subject, StudyEvent } from '../../types/subjects';
import { useNavigate } from 'react-router-dom';

const CalendarPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('10:00');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const [userSubjects, userEvents] = await Promise.all([
          subjectsService.getSubjects(currentUser.uid),
          studyEventsService.getStudyEvents(currentUser.uid)
        ]);
        setSubjects(userSubjects);
        setStudyEvents(userEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  // Show loading while checking auth state and fetching data
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="text-center p-8">
              <div className="loading-spinner"></div>
              <p className="mt-4 text-secondary">Loading calendar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleDateSelect = (selectInfo: any) => {
    setSelectedDate(selectInfo.start);
    setShowEventForm(true);
  };

  const handleEventClick = (clickInfo: any) => {
    if (window.confirm('Are you sure you want to delete this study session?')) {
      deleteStudyEvent(clickInfo.event.id);
    }
  };

  const createStudyEvent = async () => {
    if (!currentUser || !selectedDate || !selectedSubject) return;

    try {
      const startDate = new Date(selectedDate);
      const [startHr, startMin] = startHour.split(':');
      startDate.setHours(parseInt(startHr), parseInt(startMin));

      const endDate = new Date(selectedDate);
      const [endHr, endMin] = endHour.split(':');
      endDate.setHours(parseInt(endHr), parseInt(endMin));

      const subject = subjects.find(s => s.id === selectedSubject);
      const hours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

      await studyEventsService.createStudyEvent(currentUser.uid, {
        subjectId: selectedSubject,
        title: eventTitle || `${subject?.name} Study Session`,
        start: startDate,
        end: endDate,
        hours: hours,
        notes: eventNotes
      });

      // Refresh events
      const updatedEvents = await studyEventsService.getStudyEvents(currentUser.uid);
      setStudyEvents(updatedEvents);

      // Reset form
      setShowEventForm(false);
      setEventTitle('');
      setEventNotes('');
      setSelectedSubject('');
      setStartHour('09:00');
      setEndHour('10:00');
    } catch (error) {
      console.error('Error creating study event:', error);
    }
  };

  const deleteStudyEvent = async (eventId: string) => {
    if (!currentUser) return;

    try {
      await studyEventsService.deleteStudyEvent(currentUser.uid, eventId);
      const updatedEvents = await studyEventsService.getStudyEvents(currentUser.uid);
      setStudyEvents(updatedEvents);
    } catch (error) {
      console.error('Error deleting study event:', error);
    }
  };

  const calendarEvents = studyEvents.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    extendedProps: {
      subjectId: event.subjectId,
      notes: event.notes
    }
  }));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Study Calendar</h1>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{ 
              padding: '0.5rem 1rem', 
              backgroundColor: '#6b7280', 
              color: 'white', 
              border: 'none', 
              borderRadius: '0.375rem',
              cursor: 'pointer'
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          {showEventForm && (
            <div className="feature-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>
                Schedule Study Session for {selectedDate?.toLocaleDateString()}
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Subject *
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Session Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Optional custom title"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Notes
                </label>
                <textarea
                  value={eventNotes}
                  onChange={(e) => setEventNotes(e.target.value)}
                  placeholder="Add any notes about this study session"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem'
                  }}
                />
              </div>

              <div>
                <button
                  onClick={createStudyEvent}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    marginRight: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  Schedule Session
                </button>
                <button
                  onClick={() => {
                    setShowEventForm(false);
                    setEventTitle('');
                    setEventNotes('');
                    setSelectedSubject('');
                    setStartHour('09:00');
                    setEndHour('10:00');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="feature-card" style={{ padding: '1rem' }}>
            {subjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                <p>Please create subjects first before scheduling study sessions.</p>
                <button
                  onClick={() => navigate('/subjects')}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    marginTop: '1rem'
                  }}
                >
                  Go to Subjects
                </button>
              </div>
            ) : (
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                initialView="dayGridMonth"
                selectable={true}
                selectMirror={true}
                dayMaxEvents={true}
                weekends={true}
                events={calendarEvents}
                select={handleDateSelect}
                eventClick={handleEventClick}
                height="auto"
                aspectRatio={1.8}
              />
            )}
          </div>

          {studyEvents.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Upcoming Study Sessions</h3>
              <div className="feature-grid">
                {studyEvents
                  .filter(event => event.start > new Date())
                  .sort((a, b) => a.start.getTime() - b.start.getTime())
                  .slice(0, 6)
                  .map(event => {
                    const subject = subjects.find(s => s.id === event.subjectId);
                    return (
                      <div key={event.id} className="feature-card">
                        <h4>{event.title}</h4>
                        <p><strong>Subject:</strong> {subject?.name}</p>
                        <p><strong>Date:</strong> {event.start.toLocaleDateString()}</p>
                        <p><strong>Time:</strong> {event.start.toLocaleTimeString()} - {event.end.toLocaleTimeString()}</p>
                        <p><strong>Duration:</strong> {event.hours} hours</p>
                        {event.notes && <p><strong>Notes:</strong> {event.notes}</p>}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
