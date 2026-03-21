import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { score: 'desc' },
      include: {
        submissions: {
          select: { time_taken: true }
        }
      }
    });

    const leaderboard = users.map(u => {
      const totalTime = u.submissions.reduce((acc, curr) => acc + curr.time_taken, 0);
      return {
        id: u.id,
        name: u.name,
        score: u.score,
        totalTime
      };
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.totalTime - b.totalTime;
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
