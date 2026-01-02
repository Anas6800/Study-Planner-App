import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { subjectsService, studyEventsService } from '../../services/firestore';
import { Subject, StudyEvent } from '../../types/subjects';
import { useNavigate } from 'react-router-dom';

const ProgressPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<any[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const calculateStats = useCallback((subjects: Subject[], events: StudyEvent[]) => {
    console.log('Progress Debug - Subjects:', subjects);
    console.log('Progress Debug - Events:', events);
    
    // Calculate total hours studied
    const total = events.reduce((sum, event) => sum + event.hours, 0);
    setTotalHours(total);
    console.log('Progress Debug - Total Hours:', total);

    // Calculate weekly study hours (last 4 weeks)
    const weeklyHours = [];
    const today = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weekEvents = events.filter(event => 
        event.start >= weekStart && event.start < weekEnd
      );
      
      const weekTotal = weekEvents.reduce((sum, event) => sum + event.hours, 0);
      
      weeklyHours.push({
        week: `Week ${4 - i}`,
        hours: Math.round(weekTotal * 10) / 10
      });
    }
    setWeeklyData(weeklyHours);
    console.log('Progress Debug - Weekly Data:', weeklyHours);

    // Calculate subject progress - include completed hours from study events
    const subjectData = subjects.map(subject => {
      const subjectEvents = events.filter(event => event.subjectId === subject.id);
      const studiedHours = subjectEvents.reduce((sum, event) => sum + event.hours, 0);
      
      console.log(`Progress Debug - Subject ${subject.name}:`, {
        subjectId: subject.id,
        subjectEvents: subjectEvents.length,
        studiedHours: studiedHours,
        targetHours: subject.targetHours
      });
      
      return {
        name: subject.name,
        target: subject.targetHours,
        completed: Math.round(studiedHours * 10) / 10,
        progress: Math.round((studiedHours / subject.targetHours) * 100)
      };
    });
    setSubjectProgress(subjectData);
    console.log('Progress Debug - Subject Progress:', subjectData);

    // Calculate study streak
    const streakData = calculateStreak(events);
    setStreak(streakData);
    console.log('Progress Debug - Streak:', streakData);
  }, []);

  const calculateStreak = (events: StudyEvent[]): number => {
    if (events.length === 0) return 0;

    // Sort events by date
    const sortedEvents = events.sort((a, b) => a.start.getTime() - b.start.getTime());
    
    // Get unique study dates
    const studyDates = new Set(
      sortedEvents.map(event => event.start.toDateString())
    );

    // Convert to array and sort
    const dates = Array.from(studyDates).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Calculate streak from today backwards
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = dates.length - 1; i >= 0; i--) {
      const studyDate = new Date(dates[i]);
      studyDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - studyDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    return currentStreak;
  };

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
        calculateStats(userSubjects, userEvents);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, calculateStats]);

  // Show loading while checking auth state and fetching data
  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="text-center p-8">
              <div className="loading-spinner"></div>
              <p className="mt-4 text-secondary">Loading progress data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pieData = subjects.map(subject => {
    const subjectEvents = studyEvents.filter(event => event.subjectId === subject.id);
    const hours = subjectEvents.reduce((sum, event) => sum + event.hours, 0);
    return {
      name: subject.name,
      value: Math.round(hours * 10) / 10
    };
  }).filter(item => item.value > 0);

  const COLORS = ['#4f46e5', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">Progress Tracking</h1>
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
          {/* Stats Overview */}
          <div className="feature-grid" style={{ marginBottom: '2rem' }}>
            <div className="feature-card">
              <h3>Total Study Hours</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4f46e5' }}>
                {totalHours.toFixed(1)}
              </p>
              <p style={{ color: '#6b7280' }}>hours completed</p>
            </div>
            <div className="feature-card">
              <h3>Study Streak</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {streak}
              </p>
              <p style={{ color: '#6b7280' }}>days in a row</p>
            </div>
            <div className="feature-card">
              <h3>Active Subjects</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {subjects.length}
              </p>
              <p style={{ color: '#6b7280' }}>subjects studying</p>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="feature-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Weekly Study Hours (Last 4 Weeks)</h3>
            {weeklyData.length > 0 ? (
              <BarChart width={800} height={300} data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#4f46e5" />
              </BarChart>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                No study data available yet
              </p>
            )}
          </div>

          {/* Subject Progress */}
          <div className="feature-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Subject Progress</h3>
            {subjectProgress.length > 0 ? (
              <div>
                <LineChart width={800} height={300} data={subjectProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={2} />
                  <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
                <div style={{ marginTop: '1rem' }}>
                  {subjectProgress.map(subject => (
                    <div key={subject.name} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>{subject.name}</span>
                        <span>{subject.completed}/{subject.target}h ({subject.progress}%)</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '0.375rem', 
                        height: '8px',
                        marginBottom: '0.5rem'
                      }}>
                        <div 
                          style={{
                            width: `${subject.progress}%`,
                            backgroundColor: '#4f46e5',
                            height: '100%',
                            borderRadius: '0.375rem'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                No subjects available
              </p>
            )}
          </div>

          {/* Study Distribution Pie Chart */}
          {pieData.length > 0 && (
            <div className="feature-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Study Distribution by Subject</h3>
              <PieChart width={400} height={300}>
                <Pie
                  data={pieData}
                  cx={200}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          )}

          {/* Recent Study Sessions */}
          {studyEvents.length > 0 && (
            <div className="feature-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Recent Study Sessions</h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {studyEvents
                  .sort((a, b) => b.start.getTime() - a.start.getTime())
                  .slice(0, 10)
                  .map(event => {
                    const subject = subjects.find(s => s.id === event.subjectId);
                    return (
                      <div key={event.id} style={{ 
                        padding: '0.75rem', 
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <p style={{ fontWeight: '500', margin: '0 0 0.25rem 0' }}>
                            {event.title}
                          </p>
                          <p style={{ color: '#6b7280', margin: '0', fontSize: '0.875rem' }}>
                            {subject?.name} • {event.start.toLocaleDateString()}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '500', margin: '0', color: '#4f46e5' }}>
                            {event.hours}h
                          </p>
                          <p style={{ color: '#6b7280', margin: '0', fontSize: '0.875rem' }}>
                            {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
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

export default ProgressPage;
