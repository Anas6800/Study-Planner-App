import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subjectsService, studyEventsService } from '../../services/firestore';
import { Subject, StudyEvent } from '../../types/subjects';
import Logout from '../Auth/Logout';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [, setSubjects] = useState<Subject[]>([]);
  const [, setStudyEvents] = useState<StudyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayHours: 0,
    studyStreak: 0,
    totalSubjects: 0
  });

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
        
        // Calculate real-time stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Today's study hours
        const todayEvents = userEvents.filter(event => 
          event.start >= today && event.start < tomorrow
        );
        const todayHours = todayEvents.reduce((sum, event) => sum + event.hours, 0);
        
        // Study streak
        const streak = calculateStudyStreak(userEvents);
        
        // Total subjects
        const totalSubjects = userSubjects.length;
        
        setStats({
          todayHours: Math.round(todayHours * 10) / 10,
          studyStreak: streak,
          totalSubjects
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const calculateStudyStreak = (events: StudyEvent[]): number => {
    if (events.length === 0) return 0;

    // Get unique study dates
    const studyDates = new Set(
      events.map(event => event.start.toDateString())
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1 className="dashboard-title">Study Planner</h1>
            <p className="text-secondary mt-1">Organize your learning journey</p>
          </div>
          <Logout />
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="feature-card mb-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold gradient-text mb-4">
                Welcome to Your Study Dashboard! 🎓
              </h2>
              <p className="text-secondary text-lg leading-relaxed">
                Transform your learning experience with intelligent study planning, 
                progress tracking, and beautiful analytics.
              </p>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="feature-grid mb-8">
            <div 
              className="feature-card clickable-card slide-up"
              onClick={() => navigate('/subjects')}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="feature-title">
                📚 Subjects
              </div>
              <p className="feature-description">
                Create and manage your study subjects with target goals and deadlines
              </p>
              <div className="mt-4 flex items-center text-accent-primary font-semibold">
                <span>Manage Subjects</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            <div 
              className="feature-card clickable-card slide-up"
              onClick={() => navigate('/calendar')}
              style={{ animationDelay: '0.2s' }}
            >
              <div className="feature-title">
                📅 Calendar
              </div>
              <p className="feature-description">
                Schedule study sessions and visualize your learning timeline
              </p>
              <div className="mt-4 flex items-center text-accent-primary font-semibold">
                <span>View Calendar</span>
                <span className="ml-2">→</span>
              </div>
            </div>

            <div 
              className="feature-card clickable-card slide-up"
              onClick={() => navigate('/progress')}
              style={{ animationDelay: '0.3s' }}
            >
              <div className="feature-title">
                📊 Progress
              </div>
              <p className="feature-description">
                Track your study progress with detailed analytics and insights
              </p>
              <div className="mt-4 flex items-center text-accent-primary font-semibold">
                <span>View Progress</span>
                <span className="ml-2">→</span>
              </div>
            </div>
          </div>

          {/* Real-time Stats Section */}
          <div className="feature-grid mb-8">
            <div className="feature-card glass-effect slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Today's Goal</h3>
                  <p className="text-2xl font-bold gradient-text mt-1">
                    {loading ? (
                      <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                    ) : (
                      `${stats.todayHours} hrs`
                    )}
                  </p>
                  <p className="text-xs text-tertiary mt-1">
                    {stats.todayHours > 0 ? '🔥 Great progress!' : '💪 Start studying!'}
                  </p>
                </div>
                <div className="text-3xl">🎯</div>
              </div>
            </div>

            <div className="feature-card glass-effect slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Study Streak</h3>
                  <p className="text-2xl font-bold text-success mt-1">
                    {loading ? (
                      <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                    ) : (
                      `${stats.studyStreak} days`
                    )}
                  </p>
                  <p className="text-xs text-tertiary mt-1">
                    {stats.studyStreak === 0 ? '📅 Start your streak!' : 
                     stats.studyStreak === 1 ? '🔥 Keep it going!' :
                     stats.studyStreak < 7 ? '💪 Building momentum!' :
                     stats.studyStreak < 30 ? '🚀 On fire!' :
                     '⭐ Legendary status!'}
                  </p>
                </div>
                <div className="text-3xl">🔥</div>
              </div>
            </div>

            <div className="feature-card glass-effect slide-up" style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Total Subjects</h3>
                  <p className="text-2xl font-bold text-accent-primary mt-1">
                    {loading ? (
                      <div className="loading-spinner" style={{ width: '24px', height: '24px' }}></div>
                    ) : (
                      stats.totalSubjects
                    )}
                  </p>
                  <p className="text-xs text-tertiary mt-1">
                    {stats.totalSubjects === 0 ? '📚 Add your first subject!' :
                     stats.totalSubjects < 3 ? '📖 Good start!' :
                     stats.totalSubjects < 6 ? '🎓 Well rounded!' :
                     '🏆 Super student!'}
                  </p>
                </div>
                <div className="text-3xl">📚</div>
              </div>
            </div>
          </div>

          {/* Motivational Section */}
          <div className="feature-card mt-8 text-center glass-effect slide-up" style={{ animationDelay: '0.7s' }}>
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold gradient-text mb-3">
                💡 Study Tip of the Day
              </h3>
              <p className="text-secondary leading-relaxed">
                "The expert in anything was once a beginner. Every study session, 
                no matter how small, is a step toward mastery. Stay consistent, 
                stay curious, and celebrate your progress!"
              </p>
              <div className="mt-4 text-sm text-tertiary">
                {stats.todayHours > 0 && (
                  <span className="success-message inline-block">
                    🎉 You've studied {stats.todayHours} hours today! Keep it up!
                  </span>
                )}
                {stats.todayHours === 0 && (
                  <span className="text-warning">
                    💪 Ready to start today's study session?
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
