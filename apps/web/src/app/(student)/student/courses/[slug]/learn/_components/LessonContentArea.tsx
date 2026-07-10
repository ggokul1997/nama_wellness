import type { Lesson } from '@nama/shared';
import { SecureVideoPlayer } from '@/components/video/SecureVideoPlayer';

interface LessonContentAreaProps {
  courseId: string;
  activeLesson: Lesson;
  onCompleteLesson: () => void;
  initialTime?: number;
}

export function LessonContentArea({ 
  courseId,
  activeLesson, 
  onCompleteLesson, 
  initialTime = 0
}: LessonContentAreaProps) {
  return (
    <>
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--surface-border)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeLesson.title}</h1>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Type: {activeLesson.lessonType}</span>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
        <div className="glass-card" style={{ padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ width: '100%', boxSizing: 'border-box' }}>
            {activeLesson.contentUrl ? (
              activeLesson.lessonType === 'VIDEO' ? (
                <SecureVideoPlayer
                  key={activeLesson.id}
                  courseId={courseId}
                  lessonId={activeLesson.id}
                  initialTime={initialTime}
                  onLessonComplete={onCompleteLesson}
                />
              ) : (
                <>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>📄</div>
                  <a href={activeLesson.contentUrl} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                    Open Lesson Content
                  </a>
                </>
              )
            ) : (
              <div style={{ padding: '3rem 0' }}>This lesson does not have a content URL attached yet.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
