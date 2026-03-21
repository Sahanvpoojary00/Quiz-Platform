import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const state = await prisma.systemState.findUnique({ where: { id: 1 } });
    
    // Check if the current user is blocked
    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    let isBlocked = false;
    
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      isBlocked = !!user?.isBlocked;
    }

    return NextResponse.json({ state, isBlocked });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value;
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { status, currentRound } = await req.json();
    
    const updated = await prisma.systemState.update({
      where: { id: 1 },
      data: { 
        status: status !== undefined ? status : undefined,
        currentRound: currentRound !== undefined ? currentRound : undefined
      }
    });
    
    return NextResponse.json({ state: updated });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
