import prisma from './src/config/db';
import bcrypt from 'bcryptjs';

async function test() {
    try {
        const passwordHash = await bcrypt.hash('pass', 10);
        const rollNo = await prisma.$transaction(async (tx) => {
            const count = await tx.user.count({ where: { role: 'student' } });
            return 'STU-' + String(count + 1).padStart(4, '0');
        });
        const user = await prisma.user.create({
            data: { name: 'test', email: 'test'+Date.now()+'@test.com', passwordHash, role: 'student', rollNo },
        });
        console.log('SUCCESS:', user);
    } catch(e) {
        console.error('FAILED:', e);
    }
}
test();
