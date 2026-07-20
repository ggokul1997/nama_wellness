import type { Lesson } from '@nama/shared';
import { SecureVideoPlayer } from '@/components/video/SecureVideoPlayer';
import { CourseQA } from '@/components/learning/CourseQA';
import { useState } from 'react';

interface LessonContentAreaProps {
  courseId: string;
  activeLesson: Lesson;
  onCompleteLesson: () => void;
  initialTime?: number;
  defaultTab?: 'overview' | 'qa';
  defaultThreadId?: string;
}

export function LessonContentArea({ 
  courseId,
  activeLesson, 
  onCompleteLesson, 
  initialTime = 0,
  defaultTab = 'overview',
  defaultThreadId
}: LessonContentAreaProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'qa'>(defaultTab);
  return (
    <>
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--surface-border)' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{activeLesson.title}</h1>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Type: {activeLesson.lessonType}</span>
        </div>
      </div>
      <div style={{ padding: '0 2rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', gap: '2rem' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'overview' ? '2px solid var(--brand-500)' : '2px solid transparent',
            color: activeTab === 'overview' ? 'var(--brand-400)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'overview' ? 600 : 400
          }}
        >
          Lesson Overview
        </button>
        <button 
          onClick={() => setActiveTab('qa')}
          style={{ 
            background: 'none', border: 'none', padding: '1rem 0', cursor: 'pointer',
            borderBottom: activeTab === 'qa' ? '2px solid var(--brand-500)' : '2px solid transparent',
            color: activeTab === 'qa' ? 'var(--brand-400)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'qa' ? 600 : 400
          }}
        >
          Q&A
        </button>
      </div>
      
      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', overflowX: 'hidden' }}>
        {activeTab === 'overview' ? (
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
        ) : (
          <div className="glass-card" style={{ width: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <CourseQA courseId={courseId} defaultThreadId={defaultThreadId} />
          </div>
        )}
      </div>
    </>
  );
}
