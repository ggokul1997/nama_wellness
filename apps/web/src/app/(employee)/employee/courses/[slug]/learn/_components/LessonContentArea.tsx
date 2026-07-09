import type { Lesson } from '@nama/shared';

interface LessonContentAreaProps {
  activeLesson: Lesson;
  updating: boolean;
  onCompleteLesson: () => void;
  getLessonStatus: (lessonId: string) => string;
}

export function LessonContentArea({ 
  activeLesson, 
  updating, 
  onCompleteLesson, 
  getLessonStatus 
}: LessonContentAreaProps) {
  const isCompleted = getLessonStatus(activeLesson.id) === 'COMPLETED';

  return (
    <>
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--surface-border)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeLesson.title}</h1>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Type: {activeLesson.lessonType}</span>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <div className="glass-card" style={{ padding: '2rem', minHeight: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
            {activeLesson.lessonType === 'VIDEO' ? '🎥' : activeLesson.lessonType === 'DOCUMENT' ? '📄' : '🔴'}
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Lesson Content Area</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px', marginBottom: '2rem' }}>
            {activeLesson.contentUrl ? (
              <a href={activeLesson.contentUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--brand-400)' }}>
                Open Lesson Content
              </a>
            ) : (
              'This lesson does not have a content URL attached yet.'
            )}
          </p>

          <button 
            onClick={onCompleteLesson}
            disabled={updating || isCompleted}
            className="btn btn-primary"
            style={{ 
              padding: '1rem 3rem', 
              fontSize: '1.1rem',
              background: isCompleted ? 'var(--success-color)' : 'var(--brand-600)' 
            }}
          >
            {isCompleted ? '✓ Lesson Completed' : (updating ? 'Saving...' : 'Mark as Complete')}
          </button>
        </div>
      </div>
    </>
  );
}
