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
    
    const { cutoff } = await req.json();
    
    // Update the global system state with the new cutoff
    const updated = await prisma.systemState.update({
      where: { id: 1 },
      data: { cutoffScore: parseInt(cutoff) }
    });
    
    return NextResponse.json({ state: updated });
  } catch (error) {
    console.error("Set cutoff error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
