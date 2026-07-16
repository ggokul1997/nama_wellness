-- Remove LIVE and INDIVIDUAL from CourseType enum
-- Remove LIVE from LessonType enum
-- This migration is safe to apply on an empty database (after reset)
-- since no rows with LIVE or INDIVIDUAL course types exist.

ALTER TYPE "CourseType" RENAME TO "CourseType_old";
CREATE TYPE "CourseType" AS ENUM ('RECORDED', 'HYBRID');
ALTER TABLE "courses" ALTER COLUMN "courseType" TYPE "CourseType" USING "courseType"::text::"CourseType";
DROP TYPE "CourseType_old";

ALTER TYPE "LessonType" RENAME TO "LessonType_old";
CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'DOCUMENT');
ALTER TABLE "lessons" ALTER COLUMN "lessonType" TYPE "LessonType" USING "lessonType"::text::"LessonType";
DROP TYPE "LessonType_old";
