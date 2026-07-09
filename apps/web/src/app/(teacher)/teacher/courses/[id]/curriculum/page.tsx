'use client';

import { useState, useEffect, use } from 'react';
import { coursesApi } from '@/lib/api/courses';
import type { Course, CourseModule, Lesson } from '@nama/shared';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/error';

export default function CurriculumBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for creating/editing modules
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');
  const [submittingModule, setSubmittingModule] = useState(false);

  // State for creating/editing lessons
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonType, setLessonType] = useState<'VIDEO' | 'DOCUMENT' | 'LIVE'>('VIDEO');
  const [submittingLesson, setSubmittingLesson] = useState(false);
  const [lessonFile, setLessonFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [courseRes, modulesRes] = await Promise.all([
        coursesApi.getCourse(id),
        coursesApi.getModules(id)
      ]);
      setCourse(courseRes.data?.course || null);
      setModules(modulesRes.data?.modules || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load curriculum data'));
    } finally {
      setLoading(false);
    }
  };

  const openNewModule = () => {
    setEditingModule(null);
    setModuleTitle('');
    setModuleDesc('');
    setShowModuleModal(true);
  };

  const openEditModule = (m: CourseModule) => {
    setEditingModule(m);
    setModuleTitle(m.title);
    setModuleDesc(m.description || '');
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    setSubmittingModule(true);
    try {
      if (editingModule) {
        await coursesApi.updateModule(id, editingModule.id, {
          title: moduleTitle,
          description: moduleDesc
        });
      } else {
        await coursesApi.createModule(id, {
          title: moduleTitle,
          description: moduleDesc,
          sortOrder: modules.length
        });
      }
      setShowModuleModal(false);
      fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to save module'));
    } finally {
      setSubmittingModule(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module and all its lessons?')) return;
    try {
      await coursesApi.deleteModule(id, moduleId);
      fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete module'));
    }
  };

  const openNewLesson = (moduleId: string) => {
    setActiveModuleId(moduleId);
    setEditingLesson(null);
    setLessonTitle('');
    setLessonType('VIDEO');
    setLessonFile(null);
    setShowLessonModal(true);
  };

  const openEditLesson = (moduleId: string, l: Lesson) => {
    setActiveModuleId(moduleId);
    setEditingLesson(l);
    setLessonTitle(l.title);
    setLessonType(l.lessonType);
    setLessonFile(null);
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    setSubmittingLesson(true);
    try {
      let currentLesson = editingLesson;
      
      // 1. Create or Update Lesson metadata
      if (editingLesson) {
        const res = await coursesApi.updateLesson(id, activeModuleId, editingLesson.id, {
          title: lessonTitle,
          lessonType
        });
        currentLesson = res.data?.lesson || null;
      } else {
        const moduleLessons = modules.find(m => m.id === activeModuleId)?.lessons || [];
        const res = await coursesApi.createLesson(id, activeModuleId, {
          title: lessonTitle,
          lessonType,
          sortOrder: moduleLessons.length
        });
        currentLesson = res.data?.lesson || null;
      }

      // 2. Upload file if provided
      if (lessonFile && currentLesson) {
        setUploadProgress(10);
        const { data: presigned } = await coursesApi.getPresignedLessonUrl(
          id, activeModuleId, currentLesson.id, lessonFile.type, lessonFile.size
        );
        
        if (presigned) {
          setUploadProgress(40);
          const uploadRes = await fetch(presigned.uploadUrl, {
            method: 'PUT',
            body: lessonFile,
            headers: { 'Content-Type': lessonFile.type },
          });

          if (!uploadRes.ok) throw new Error('File upload to S3 failed');
          setUploadProgress(90);

          // Update lesson with final URL
          await coursesApi.updateLesson(id, activeModuleId, currentLesson.id, {
            contentUrl: presigned.fileUrl
          });
          setUploadProgress(100);
        }
      }

      setShowLessonModal(false);
      setUploadProgress(0);
      fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to save lesson'));
      setUploadProgress(0);
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await coursesApi.deleteLesson(id, moduleId, lessonId);
      fetchData();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete lesson'));
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading curriculum...</div>;
  if (error || !course) return <div className="alert alert-error">{error || 'Course not found'}</div>;

  return (
    <div className="page-content" style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href={`/teacher/courses`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          ← Back to Courses
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Curriculum Builder</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {course.title}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => router.push(`/teacher/courses/${id}/sessions`)} className="btn btn-ghost" style={{ border: '1px solid var(--surface-border)' }}>
            Live Sessions
          </button>
          <button onClick={() => router.push(`/teacher/courses/${id}/materials`)} className="btn btn-ghost" style={{ border: '1px solid var(--surface-border)' }}>
            Study Materials
          </button>
          <button onClick={openNewModule} className="btn btn-primary">
            + Add Module
          </button>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Your course currently has no modules.</p>
          <button onClick={openNewModule} className="btn btn-primary">Create Your First Module</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {modules.map((module, index) => (
            <div key={module.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-500)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Module {index + 1}: {module.title}
                  </h3>
                  {module.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{module.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEditModule(module)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>Edit</button>
                  <button onClick={() => handleDeleteModule(module.id)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', color: 'var(--error)' }}>Delete</button>
                </div>
              </div>

              <div style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                {(!module.lessons || module.lessons.length === 0) ? (
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No lessons in this module yet.</p>
                ) : (
                  module.lessons.map((lesson, lIndex) => (
                    <div key={lesson.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{index + 1}.{lIndex + 1}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{lesson.title}</span>
                            <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '1rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--brand-400)', fontWeight: 600 }}>{lesson.lessonType}</span>
                          </div>
                          {lesson.contentUrl && (
                            <a href={lesson.contentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--success)', textDecoration: 'none', display: 'inline-block', marginTop: '0.25rem' }}>
                              ✓ Content Uploaded
                            </a>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEditLesson(module.id, lesson)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Edit</button>
                        <button onClick={() => handleDeleteLesson(module.id, lesson.id)} className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--error)' }}>Delete</button>
                      </div>
                    </div>
                  ))
                )}
                
                <div style={{ marginTop: '0.5rem' }}>
                  <button onClick={() => openNewLesson(module.id)} className="btn btn-ghost" style={{ fontSize: '0.875rem', color: 'var(--brand-400)' }}>
                    + Add Lesson
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modules.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Link href={`/teacher/courses/${id}/publish`} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
            Continue to Publishing →
          </Link>
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {editingModule ? 'Edit Module' : 'Create Module'}
            </h2>
            <form onSubmit={handleSaveModule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Module Title</label>
                <input type="text" className="input" value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} required minLength={3} placeholder="E.g. Introduction to Yoga" />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <textarea className="input" value={moduleDesc} onChange={e => setModuleDesc(e.target.value)} rows={3} placeholder="Briefly describe what this module covers" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModuleModal(false)} className="btn btn-ghost" disabled={submittingModule}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingModule}>{submittingModule ? 'Saving...' : 'Save Module'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
            </h2>
            <form onSubmit={handleSaveLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Lesson Title</label>
                <input type="text" className="input" value={lessonTitle} onChange={e => setLessonTitle(e.target.value)} required minLength={3} placeholder="E.g. Breathing Techniques" />
              </div>
              <div>
                <label className="label">Lesson Type</label>
                <select className="input" value={lessonType} onChange={e => setLessonType(e.target.value as Lesson['lessonType'])}>
                  <option value="VIDEO">Video</option>
                  <option value="DOCUMENT">Document / PDF</option>
                </select>
              </div>
              <div>
                <label className="label">Upload Content {editingLesson?.contentUrl && '(Optional - to replace)'}</label>
                <input 
                  type="file" 
                  className="input" 
                  style={{ padding: '0.5rem' }}
                  accept={lessonType === 'VIDEO' ? 'video/*' : '.pdf,.doc,.docx'} 
                  onChange={e => setLessonFile(e.target.files?.[0] || null)} 
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Max size: 500MB</p>
              </div>
              
              {uploadProgress > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ height: '6px', background: 'var(--surface-border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--brand-500)', width: `${uploadProgress}%`, transition: 'width 0.3s' }}></div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', textAlign: 'center' }}>Uploading... {uploadProgress}%</p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowLessonModal(false)} className="btn btn-ghost" disabled={submittingLesson}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submittingLesson}>{submittingLesson ? 'Saving...' : 'Save Lesson'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
