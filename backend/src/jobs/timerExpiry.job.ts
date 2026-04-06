import cron from 'node-cron';
import prisma from '../config/db';
import redis from '../config/redis';
import { computeScore } from '../services/score.service';
import { flushRedisBuffer } from '../controllers/session.controller';

export const startTimerExpiryJob = () => {
  cron.schedule('*/10 * * * * *', async () => {
    try {
      const activeSessions = await prisma.session.findMany({ where: { status: 'active' }, include: { quiz: true } });
      for (const session of activeSessions) {
        let remaining = await redis.get(`session:${session.id}:remaining`);
        
        // RECOVERY: If missing from Redis (due to restart), calculate from DB
        if (remaining === null) {
          const elapsed = (Date.now() - new Date(session.startedAt).getTime()) / 1000;
          const timeLeft = session.quiz.durationSeconds - elapsed;
          
          if (timeLeft > 0) {
            console.log(`Recovering session timer for ${session.id}: ${Math.floor(timeLeft)}s left`);
            await redis.setEx(`session:${session.id}:remaining`, Math.floor(timeLeft), String(Math.floor(timeLeft)));
            continue; // Don't submit yet
          }
          // If timeLeft <= 0, it really is expired, proceed to submit
        }

        if (remaining !== null && parseInt(remaining as string) <= 0 || remaining === null) {
          console.log(`Auto-submitting expired session: ${session.id}`);
          await flushRedisBuffer(session.id);
          const { score, totalMarks } = await computeScore(session.id, session.quizId);
          await prisma.session.update({ where: { id: session.id }, data: { status: 'expired', submittedAt: new Date(), score, totalMarks } });
          await redis.del(`session:${session.id}:remaining`);
          await redis.del(`session:${session.id}:buffer`);
        }
      }
    } catch (err) { console.error('Timer expiry job error:', err); }
  });
  console.log('Timer expiry job started');
};
