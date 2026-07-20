import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill for notifications...');
  
  // Get all notifications of type "New Reply to your Question" that don't have a link
  const notifications = await prisma.notification.findMany({
    where: {
      title: 'New Reply to your Question',
      link: null
    }
  });

  console.log(`Found ${notifications.length} notifications to backfill.`);

  let updatedCount = 0;
  for (const notif of notifications) {
    // The message format is: Someone replied to your question "TITLE".
    const match = notif.message.match(/Someone replied to your question "(.*)"\./);
    if (match && match[1]) {
      const threadTitle = match[1];
      
      // Find the thread with this title belonging to this user
      const threads = await prisma.courseDiscussionThread.findMany({
        where: {
          title: threadTitle,
          authorId: notif.userId
        },
        include: {
          course: true
        }
      });

      if (threads.length === 1) {
        const thread = threads[0]!;
        const link = `/student/courses/${thread.course.slug}/learn?tab=qa&threadId=${thread.id}`;
        
        await prisma.notification.update({
          where: { id: notif.id },
          data: { link }
        });
        
        console.log(`Updated notification ${notif.id} with link: ${link}`);
        updatedCount++;
      } else {
        console.log(`Could not uniquely match thread for notification ${notif.id}. Found ${threads.length} threads.`);
      }
    }
  }

  console.log(`Backfill complete. Updated ${updatedCount} notifications.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
