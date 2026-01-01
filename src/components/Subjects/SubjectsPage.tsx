import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subjectsService } from '../../services/firestore';
import { Subject } from '../../types/subjects';
import { useNavigate } from 'react-router-dom';

const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetHours: 0,
    targetDate: ''
  });
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchSubjects = async () => {
      try {
        const userSubjects = await subjectsService.getSubjects(currentUser.uid);
        setSubjects(userSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      if (editingSubject) {
        // Update existing subject
        await subjectsService.updateSubject(currentUser.uid, editingSubject.id, {
          ...formData,
          targetDate: new Date(formData.targetDate)
        });
      } else {
        // Create new subject
        await subjectsService.createSubject(currentUser.uid, {
          name: formData.name,
          description: formData.description,
          targetHours: formData.targetHours,
          completedHours: 0,
          targetDate: new Date(formData.targetDate)
        });
      }

      // Refresh subjects list
      const updatedSubjects = await subjectsService.getSubjects(currentUser.uid);
      setSubjects(updatedSubjects);
      
      // Reset form
      setFormData({ name: '', description: '', targetHours: 0, targetDate: '' });
      setShowForm(false);
      setEditingSubject(null);
    } catch (error) {
      console.error('Error saving subject:', error);
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      targetHours: subject.targetHours,
      targetDate: subject.targetDate.toISOString().split('T')[0]
    });
    setShowForm(true);
  };

  const handleDelete = async (subjectId: string) => {
    if (!currentUser) return;
    
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsService.deleteSubject(currentUser.uid, subjectId);
        const updatedSubjects = await subjectsService.getSubjects(currentUser.uid);
        setSubjects(updatedSubjects);
      } catch (error) {
        console.error('Error deleting subject:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSubject(null);
    setFormData({ name: '', description: '', targetHours: 0, targetDate: '' });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-main">
          <div className="dashboard-content">
            <div className="text-center p-8">
              <div className="loading-spinner"></div>
              <p className="mt-4 text-secondary">Loading subjects...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div>
            <h1 className="dashboard-title">📚 Subjects</h1>
            <p className="text-secondary mt-1">Manage your study subjects and goals</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            ← Back to Dashboard
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* Add Subject Button */}
          <div className="mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <span className="mr-2">➕</span>
              Add New Subject
            </button>
          </div>

          {/* Subject Form */}
          {showForm && (
            <div className="feature-card mb-8 slide-up">
              <h3 className="text-xl font-bold gradient-text mb-6">
                {editingSubject ? '✏️ Edit Subject' : '🆕 Add New Subject'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">
                      📝 Subject Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                      placeholder="e.g., Mathematics, Physics, History"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      ⏰ Target Study Hours *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.targetHours}
                      onChange={(e) => setFormData({ ...formData, targetHours: parseInt(e.target.value) })}
                      className="form-input"
                      placeholder="e.g., 40"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    📄 Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-textarea"
                    placeholder="Add notes about this subject..."
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    📅 Target Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingSubject ? '💾 Update Subject' : '🚀 Create Subject'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-secondary"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Subjects Grid */}
          <div className="feature-grid">
            {subjects.length === 0 ? (
              <div className="feature-card col-span-full text-center">
                <div className="py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-primary mb-2">No subjects yet</h3>
                  <p className="text-secondary mb-6">
                    Start by adding your first study subject!
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="btn btn-primary"
                  >
                    <span className="mr-2">➕</span>
                    Add Your First Subject
                  </button>
                </div>
              </div>
            ) : (
              subjects.map((subject, index) => (
                <div 
                  key={subject.id} 
                  className="feature-card slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-primary">
                      {subject.name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="btn btn-ghost text-sm"
                        title="Edit subject"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="btn btn-ghost text-sm text-error"
                        title="Delete subject"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {subject.description && (
                    <p className="text-secondary text-sm mb-4">
                      {subject.description}
                    </p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">📊 Progress:</span>
                      <span className="font-semibold">
                        {subject.completedHours}/{subject.targetHours}h 
                        ({Math.round((subject.completedHours / subject.targetHours) * 100)}%)
                      </span>
                    </div>
                    
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${Math.min((subject.completedHours / subject.targetHours) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary">📅 Target:</span>
                      <span className="font-medium">
                        {subject.targetDate.toLocaleDateString()}
                      </span>
                    </div>
                    
                    {subject.completedHours >= subject.targetHours && (
                      <div className="success-message text-center mt-3">
                        🎉 Goal Achieved! Great job!
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SubjectsPage;
