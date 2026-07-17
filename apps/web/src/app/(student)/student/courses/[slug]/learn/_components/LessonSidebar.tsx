import type { Course, CourseModule, Lesson, Enrollment } from '@nama/shared';
import { useState, useEffect } from 'react';

interface LessonSidebarProps {
  course: Course;
  enrollment: Enrollment;
  activeLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  getLessonStatus: (lessonId: string) => string;
  onToggleLessonStatus?: (lessonId: string, currentStatus: string) => void;
  onClaimCertificate?: () => void;
  onLeaveReview?: () => void;
  onBookSession?: () => void;
  claimingCert?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function LessonSidebar({ 
  course, 
  enrollment, 
  activeLesson, 
  onSelectLesson, 
  getLessonStatus,
  onToggleLessonStatus,
  onClaimCertificate,
  onLeaveReview,
  onBookSession,
  claimingCert,
  isOpen = false,
  onClose
}: LessonSidebarProps) {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeLesson && course.modules) {
      const activeModule = course.modules.find(m => m.lessons?.some(l => l.id === activeLesson.id));
      if (activeModule) {
        setExpandedModules(prev => ({
          ...prev,
          [activeModule.id]: true
        }));
      }
    }
  }, [activeLesson, course.modules]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'is-open' : ''}`} 
        onClick={onClose} 
      />
      <aside className={`lesson-sidebar ${isOpen ? 'is-open' : ''}`}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{course.title}</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Status: {enrollment.status}</p>
          </div>
          {onClose && (
            <button className="hide-desktop btn btn-ghost" onClick={onClose} style={{ padding: '0.25rem', fontSize: '1.5rem', lineHeight: 1 }}>
              ×
            </button>
          )}
        </div>
        
        {onBookSession && (
          <div style={{ padding: '0 1.5rem' }}>
            <button 
              onClick={() => {
                onBookSession();
                if (onClose) onClose();
              }}
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.875rem', marginTop: '0.5rem' }}
            >
              Book 1-on-1 Session 📅
            </button>
          </div>
        )}
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {course.modules?.map((module: CourseModule) => (
          <div key={module.id} style={{ marginBottom: '1.5rem' }}>
            <div 
              onClick={() => toggleModule(module.id)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', marginBottom: '0.75rem', userSelect: 'none' }}
            >
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                {module.title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {expandedModules[module.id] ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedModules[module.id] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {module.lessons?.map((lesson: Lesson) => {
                  const status = getLessonStatus(lesson.id);
                  const isActive = activeLesson?.id === lesson.id;
                  
                  return (
                    <div 
                      key={lesson.id}
                      onClick={() => {
                        onSelectLesson(lesson);
                        if (onClose) onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: isActive ? 'var(--brand-500)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s'
                      }}
                      className={!isActive ? 'hover:bg-white/5' : ''}
                      role="button"
                      tabIndex={0}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onToggleLessonStatus) onToggleLessonStatus(lesson.id, status);
                        }}
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          width: '20px', height: '20px', borderRadius: '50%', 
                          background: status === 'COMPLETED' ? (isActive ? '#fff' : 'var(--brand-500)') : 'rgba(255,255,255,0.1)',
                          color: status === 'COMPLETED' ? (isActive ? 'var(--brand-600)' : '#fff') : 'transparent',
                          fontSize: '0.75rem',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0
                        }}>
                        {status === 'COMPLETED' && '✓'}
                      </button>
                      <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                        {lesson.title}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {enrollment.status === 'COMPLETED' && (
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {onClaimCertificate && (
            <button 
              onClick={onClaimCertificate} 
              disabled={claimingCert}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.875rem' }}
            >
              {claimingCert ? 'Claiming...' : 'Claim Certificate 🎓'}
            </button>
          )}
          {onLeaveReview && (
            <button 
              onClick={onLeaveReview}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.875rem' }}
            >
              Leave a Review ⭐
            </button>
          )}
        </div>
      )}
    </aside>
    </>
  );
}
