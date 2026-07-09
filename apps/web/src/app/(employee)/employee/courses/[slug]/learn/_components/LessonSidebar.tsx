import type { Course, CourseModule, Lesson, Enrollment } from '@nama/shared';

interface LessonSidebarProps {
  course: Course;
  enrollment: Enrollment;
  activeLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
  getLessonStatus: (lessonId: string) => string;
}

export function LessonSidebar({ 
  course, 
  enrollment, 
  activeLesson, 
  onSelectLesson, 
  getLessonStatus 
}: LessonSidebarProps) {
  return (
    <aside style={{ width: '300px', borderRight: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', background: 'var(--surface-color)' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{course.title}</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status: {enrollment.status}</p>
      </div>
      
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        {course.modules?.map((module: CourseModule) => (
          <div key={module.id} style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {module.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {module.lessons?.map((lesson: Lesson) => {
                const status = getLessonStatus(lesson.id);
                const isActive = activeLesson?.id === lesson.id;
                
                return (
                  <button 
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson)}
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
                  >
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '20px', height: '20px', borderRadius: '50%', 
                      background: status === 'COMPLETED' ? (isActive ? '#fff' : 'var(--brand-500)') : 'rgba(255,255,255,0.1)',
                      color: status === 'COMPLETED' ? (isActive ? 'var(--brand-600)' : '#fff') : 'transparent',
                      fontSize: '0.75rem'
                    }}>
                      {status === 'COMPLETED' && '✓'}
                    </span>
                    <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      {lesson.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
