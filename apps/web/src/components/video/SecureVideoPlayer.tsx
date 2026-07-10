'use client';

import { useEffect, useRef, useCallback } from 'react';
import { enrollmentsApi } from '@/lib/api/enrollments';

interface SecureVideoPlayerProps {
  courseId: string;
  lessonId: string;
  initialTime?: number;
  onLessonComplete?: () => void;
}

export function SecureVideoPlayer({ courseId, lessonId, initialTime = 0, onLessonComplete }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Use refs so callbacks never go stale and never cause re-renders
  const completedRef = useRef(false);
  const hasResumedRef = useRef(false);
  const lastSyncTime = useRef(initialTime);
  const onLessonCompleteRef = useRef(onLessonComplete);
  onLessonCompleteRef.current = onLessonComplete;

  // Same-origin proxy path — browser attaches auth cookie automatically
  // and sends HTTP Range requests for true streaming (no full download needed)
  const streamUrl = `/api/v1/courses/lessons/${lessonId}/stream`;

  const syncProgress = useCallback(async (forceComplete = false) => {
    const video = videoRef.current;
    if (!video) return;

    const currentTime = video.currentTime;
    const duration = video.duration;

    // When forceComplete (ended event), still sync even if duration is unknown
    if (!forceComplete) {
      if (!duration || currentTime === 0) return;
      if (Math.abs(currentTime - lastSyncTime.current) < 5) return;
    }

    lastSyncTime.current = currentTime;

    // Calculate progress — if duration unknown at end, assume 100%
    const progressPercent = duration ? Math.min(100, Math.round((currentTime / duration) * 100)) : 100;
    const isCompleted = forceComplete || progressPercent >= 90;
    const status = isCompleted ? 'COMPLETED' : 'IN_PROGRESS';

    try {
      await enrollmentsApi.updateLessonProgress(courseId, lessonId, {
        status: status as 'COMPLETED' | 'IN_PROGRESS',
        progressPercent: forceComplete ? 100 : progressPercent,
        lastWatchedTimestamp: Math.floor(currentTime),
      });

      if (isCompleted && !completedRef.current) {
        completedRef.current = true;
        onLessonCompleteRef.current?.();
      }
    } catch (err) {
      console.error('Failed to sync lesson progress', err);
    }
  }, [courseId, lessonId]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video || hasResumedRef.current) return;
    hasResumedRef.current = true;
    if (initialTime > 0 && initialTime < video.duration - 5) {
      video.currentTime = initialTime;
    }
  }, [initialTime]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - lastSyncTime.current) >= 10) {
      syncProgress();
    }
  }, [syncProgress]);

  const handleEnded = useCallback(() => {
    // Force-complete: video played to the very end
    syncProgress(true);
  }, [syncProgress]);

  // Sync on unmount to capture last position
  useEffect(() => {
    return () => { syncProgress(); };
  }, [syncProgress]);

  return (
    <div style={{
      width: '100%',
      aspectRatio: '16 / 9',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#000',
      boxShadow: 'var(--shadow-lg)',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <video
        ref={videoRef}
        src={streamUrl}
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
      />
    </div>
  );
}
