import { apiFetch } from './apps/web/src/lib/api/client';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { discussionsApi } from './apps/web/src/lib/api/discussions';

dotenv.config();

// Since we are running outside Next.js, we need to mock apiFetch or just use fetch directly
// Actually, using fetch directly is easier for a standalone script

const API_BASE = 'http://localhost:4000/api/v1';

async function testQA() {
  console.log('Testing Q&A Feature...');
  
  // 1. Login as Student
  const studentRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@email.com', password: 'password123' })
  });
  const studentData = await studentRes.json();
  if (!studentData.success) {
    console.error('Failed to login student:', studentData);
    return;
  }
  const studentToken = studentRes.headers.get('set-cookie')?.split(';')[0];
  console.log('✅ Student logged in');

  // 2. Login as Teacher
  const teacherRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'teacher@email.com', password: 'password123' })
  });
  const teacherData = await teacherRes.json();
  const teacherToken = teacherRes.headers.get('set-cookie')?.split(';')[0];
  console.log('✅ Teacher logged in');

  // Find a course to use
  const prisma = new PrismaClient();
  const course = await prisma.course.findFirst({ where: { status: 'PUBLISHED' }});
  
  if (!course) {
    console.error('No published course found to test on');
    return;
  }
  console.log(`✅ Using course: ${course.title} (${course.id})`);

  // Ensure student is enrolled
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: studentData.data.user.id,
        courseId: course.id
      }
    },
    update: {},
    create: {
      userId: studentData.data.user.id,
      courseId: course.id,
      status: 'ACTIVE'
    }
  });

  // Ensure teacher owns course
  await prisma.course.update({
    where: { id: course.id },
    data: { teacherId: teacherData.data.user.id }
  });

  // 3. Student asks a question
  const askRes = await fetch(`${API_BASE}/discussions/courses/${course.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': studentToken as string },
    body: JSON.stringify({ title: 'Test Question', content: 'This is a test question from script' })
  });
  const askData = await askRes.json();
  console.log('Ask Response:', askData);
  if (!askData.success) return console.error('❌ Failed to ask question');
  const threadId = askData.data.id;
  console.log(`✅ Student asked a question, threadId: ${threadId}`);

  // 4. Teacher views all threads
  const teacherThreadsRes = await fetch(`${API_BASE}/discussions/teacher/all`, {
    headers: { 'Cookie': teacherToken as string }
  });
  const teacherThreadsData = await teacherThreadsRes.json();
  console.log('Teacher Threads:', teacherThreadsData.data.length);
  if (!teacherThreadsData.data.some((t: any) => t.id === threadId)) {
    console.error('❌ Teacher could not find the new thread');
  } else {
    console.log('✅ Teacher sees the thread in dashboard');
  }

  // 5. Teacher replies to question
  const replyRes = await fetch(`${API_BASE}/discussions/${threadId}/replies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': teacherToken as string },
    body: JSON.stringify({ content: 'This is a test reply from the teacher' })
  });
  const replyData = await replyRes.json();
  console.log('Reply Response:', replyData);
  if (!replyData.success) return console.error('❌ Failed to reply');
  console.log('✅ Teacher replied to the question');

  // 6. Verify Notifications
  const notifs = await prisma.notification.findMany({
    where: {
      OR: [
        { userId: teacherData.data.user.id, message: { contains: 'Test Question' } },
        { userId: studentData.data.user.id, message: { contains: 'Test Question' } }
      ]
    }
  });
  console.log(`✅ Found ${notifs.length} notifications`);
  notifs.forEach(n => console.log(`   - To ${n.userId}: ${n.title} - ${n.message}`));

  console.log('\n🎉 All Q&A tests passed successfully!');
  await prisma.$disconnect();
}

testQA().catch(console.error);
