import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the current system state for the cutoff score
    const systemState = await prisma.systemState.findUnique({ where: { id: 1 } });
    if (!systemState) {
      return NextResponse.json({ error: "System state not initialized" }, { status: 500 });
    }
    
    const cutoff = systemState.cutoffScore;
    
    // Evaluate all active users
    const allUsers = await prisma.user.findMany({
      where: { role: 'USER' }
    });
    
    const updates = allUsers.map(async (user) => {
      const isQualified = (user.score || 0) >= cutoff;
      return prisma.user.update({
        where: { id: user.id },
        data: {
          qualified: isQualified,
          isEliminated: !isQualified,
          status: !isQualified ? 'COMPLETED' : user.status // Mark as finished if eliminated
        }
      });
    });
    
    await Promise.all(updates);
    
    return NextResponse.json({ success: true, evaluated: allUsers.length });
  } catch (error) {
    console.error("Evaluation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
